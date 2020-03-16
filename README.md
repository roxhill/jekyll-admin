
# Setting up for development of the plugin

For background information please see the README on the marketing repository at https://github.com/roxhill/marketing.

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
$ git clone git@github.com:roxhill/jekyll-admin.git
$ git clone git@github.com:roxhill/marketing.git site
```

When running, the public site should be visible on http://127.0.0.1:4000. The admin page has "admin" appended, i.e. http://127.0.0.1:4000/admin (this principle is mirrored on the live staging site at https://marketing.roxhillmedia.com/admin after login. Everyone shares the same login to the admin site with credentials available from the team). In general `Save` buttons commit a page to the staging site, and `Publish` commits to the public site.

To make changes to the admin panels follow the instructions in https://jekyll.github.io/jekyll-admin/development/. Enter the `jekyll-admin` repo and do the following commands. These will build a local `_site` directory inside the repo from the files in the `site` checkout described above.

```
$ script/bootstrap
$ script/build
$ script/test-server
```

**Note that deleting or publishing from this local checkout will still apply git commands that MODIFY THE MAIN SITE. Work network-isolated or take other precautions.**
