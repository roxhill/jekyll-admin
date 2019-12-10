
# Roxhill's marketing site

Roxhill's main site is served via Amazon Cloudfront out of an S3 bucket named `roxhillmedia.com` with a staging version and admin page served from a container in an EC2 instance. The homepage is generated from the files in _this_ repository but the code completing the _container_ is found on the `marketing` branch of the main `roxhill` repository. Every change to the master branch of the marketing site causes the container to be redeployed.

The site uses the Ruby-based tool [Jekyll](https://jekyllrb.com). This fork of the Jekyll Admin plugin adds publish functionality.

#### Principles

Jekyll-related images are stored in the AWS North Virginia region. The images are:

* `roxhill/jekyll-proxy:prod` _(last pushed in 2017)._
* `roxhill/marketing-src:prod`
  This is the constantly updated site. There are now 1870 images in the repository. Previously Amazon applied a limit of 1,000 to the number of images in a repository but this has since been increased to **10,000**.
* `roxhill/jekyll:prod` _(last updated September 2019)._
  The image is deployed from the `jekyll-admin` repository in GitHub.

The marketing site is driven by changes to the master branch of the `roxhill/marketing` repository. The `/.circleci/config.yml` file manifests the following steps:

1. GitHub signals CircleCI to checkout the repository and login to AWS
2. The Roxhill `roxhill/jekyll:prod` image is used to build a new version of the site with the admin plugin attached
3. Most files that have `.html` extensions are changed so that those extensions are not included
4. The files are then synced to S3 in the `roxhillmedia.com` bucket
5. Specific redirects described in `/_data/redirects.yml` are actioned on S3 via the AWS S3 API.
6. Amazon Cloudfront is instructed to invalidate its cache
7. A new marketing-src image is built
8. A new marketing-src image is pushed to the Amazon ECS repository

The CircleCI part takes roughly 3 minutes to complete.

Because the files are served out of S3 there is no automatic restart of the executing task in AWS. ECS has a "Cluster" named `jekyll-cluster-1709281557` of a single EC2-launched task (the actual instance is listed under the `ECS Instances` tab). The containers are listed under the `Tasks` tab by clicking on the ID for the single task. `nginx` and `jekyll` should both be running but `src` will not be. Clicking the task will show when it restarted.

#### Ruby Setup

To setup your system to begin development follow the instructions for your system at https://jekyllrb.com/docs/installation/#requirements.

For the Mac the steps begin with getting the command-line tools locally. With luck, they are already present on the system:

```
$ xcode-select --install
xcode-select: error: command line tools are already installed, use "Software Update" to install updates
```

Then get a recent version of Ruby. The `New Starter : Setup` instructions on the Roxhill Wiki describe how to get Homebrew but the command is included below if this is yet to be done:

```
# Install Homebrew if it wasn't done with setup
# /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
$ brew install ruby
...
$ echo 'export PATH="/usr/local/opt/ruby/bin:$PATH"' >> ~/.bash_profile
```

At this point relaunch your terminal to make the updates to the `.bash_profile` take effect. Get the newly installed Ruby version and update the PATH again, this time with the future gem path using only the major.minor.0 portion of the Ruby version.

```
$ ruby -v
ruby 2.6.5p114 (2019-10-01 revision 67812) [x86_64-darwin18]
$ echo 'export PATH="$HOME/.gem/ruby/2.6.0/bin:$PATH"' >> ~/.bash_profile
```

Restart the terminal again. Because macOS already has an older version of Ruby installed with the OS, it isn't recommended to try installing Bundler and Jekyll globally. Doing so gives an error like `"bundle" from bundler conflicts with /usr/local/lib/ruby/gems/2.6.0/bin/bundle`. However, in variance with the printed instructions you still need `sudo` to install Jekyll to avoid `Permission denied @ rb_sysopen` errors. Note a specific version of Bundler is required.

```
$ sudo gem install --user-install bundler -v1.17
$ sudo gem install --user-install jekyll
...
Done installing documentation for public_suffix, addressable, colorator, http_parser.rb, eventmachine, em-websocket, concurrent-ruby, i18n, ffi, sassc, jekyll-sass-converter, rb-fsevent, rb-inotify, listen, jekyll-watch, kramdown, kramdown-parser-gfm, liquid, mercenary, forwardable-extended, pathutil, rouge, safe_yaml, unicode-display_width, terminal-table, jekyll after 24 seconds
26 gems installed
```

Jekyll's admin plugin requires Node but some of the dependencies aren't available for the latest version. An earlier version of this will need to be installed too, which won't be symlinked because it's a variant install.

```
brew install node@10
echo 'export PATH="/usr/local/opt/node@10/bin:$PATH"' >> ~/.bash_profile
```

#### Development Setup

The following command checks out the marketing branch of the main repository, the locally-forked `jekyll-admin` plugin and the marketing repository (which should be renamed `site` to match the symbolic link in the plugin).

```
$ git clone -b marketing git@github.com:roxhill/roxhill.git roxhill-marketing
$ git clone git@github.com:roxhill/jekyll-admin.git jekyll-admin
$ git clone git@github.com:roxhill/marketing.git site
```

If desired, start and stop the Docker Compose development environment from inside the `roxhill-marketing` repo:

```
# Start the dev environment.
# Requires a working AWS login, using roxhillapi:/ops/bin/local/login
$ ./start-dev-env

# Stop the dev environment.
$ ./stop-dev-env
```

When running, the public site should be visible on http://127.0.0.1:4000. The admin page has "admin" appended, i.e. http://127.0.0.1:4000/admin (this principle is mirrored on the live staging site at https://marketing.roxhillmedia.com/admin after login. Everyone shares the same login to the admin site with credentials available from the team). In general `Save` buttons commit a page to the staging site, and `Publish` commits to the public site.

To make changes to the admin panels follow the instructions in https://jekyll.github.io/jekyll-admin/development/. Enter the `jekyll-admin` repo and do the following commands. These will build a local `_site` directory inside the repo from the files in the `site` checkout described above.

```
$ script/bootstrap
$ script/build
$ script/test-server
```

**Note that deleting or publishing from this local checkout will still apply git commands that MODIFY THE MAIN SITE. Work network-isolated or take other precautions.**

#### Failure scenarios

##### “Marketing site is not working at all” and marketing.roxhillmedia.com returns 502 or similar

EC2 will occasionally restart the container, and that’s why it needs the `src` image. However, the volume is preserved during the restart so saved changes are still there after the machine has booted up again.

##### Deleting a page fails specifying a plausible but not real filename

For example:

```
/usr/local/lib/ruby/gems/2.6.0/gems/jekyll-3.8.6/lib/jekyll/reader.rb:42: warning: conflicting chdir during another chdir block
             Error: No such file or directory @ rb_sysopen - /Users/tony/Documents/jekyll-admin/spec/fixtures/site/insight-and-events/tools
             Error: Run jekyll build --trace for more information.
```

This is under investigation but appears to be a race condition. See https://github.com/jekyll/jekyll-admin/issues/289#issuecomment-278365937.
