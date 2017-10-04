module JekyllAdmin
  class Server < Sinatra::Base
    include JekyllAdmin::PathHelper

    PRODUCTION_BRANCH = "marketing"
    DRAFT_BRANCH_PREFIX = "marketing-draft-"

    namespace "/version" do

      # List all versions.
      get do
        json(transform_branch_names_to_maps([prod_branch_name].push(*get_draft_branch_names)))
      end

      # Create a new version.
      post do
        json(create_branch)
      end

      # Save the current version.
      put do
        json(save_branch)
      end

      # Delete the current version.
      delete do
        json(delete_branch)
      end

      # Switch to another version
      get "/load" do
        version = params[:version]
        json(load_branch(version))
      end

      # Promote a version to production version (to publish it).
      get "/promote" do
        json(promote_branch)
      end

      # Check if versioning is supported (src dir is git repo).
      get "/available" do
        json({ :git => (git_repo != false) })
      end

      private

      # Get site source directory.
      def src_dir
        @src_dir ||= JekyllAdmin.site.source
      end

      # Get production version branch name from jekyll site config.
      def prod_branch_name
        @prod_branch_name ||= JekyllAdmin.site.config["jekyll_admin"]["versioning"]["prod_branch_name"]
      end

      # Get draft version branch name prefix from jekyll site config.
      def draft_branch_name_prefix
        @draft_branch_name_prefix ||= JekyllAdmin.site.config["jekyll_admin"]["versioning"]["draft_branch_prefix"]
      end

      # Get the src git repo instance.
      def git_repo
        begin
          @git_repo ||= Git.open(JekyllAdmin.site.source) #, :log => Jekyll.logger)
        rescue ArgumentError
          Jekyll.logger.warn "Not a git repo: " + $!.message
          @git_repo ||= false
        end
      end

      # Execute an arbitrary git command.
      def git_cmd(git_command_args)
        cmd = "git --git-dir='#{src_dir}/.git' --work-tree='#{src_dir}' #{git_command_args} 2>&1"
        Jekyll.logger.warn "             Git I: " + cmd
        result = `#{cmd}`
        Jekyll.logger.warn "             Git O: " + result.sub("\n", ' ')[0,150]
        result.split("\n")
      end

      # Get the current branch name.
      def get_current_branch_name
        git_cmd('branch -l').select{ |branch| branch.include? '* ' }.map{ |branch| branch[2..-1] }.first
      end

      # List branch names (does not use ruby-git because too slow https://github.com/schacon/ruby-git/issues/291).
      def get_draft_branch_names
        git_cmd('branch -l').select{ |branch| branch.include? draft_branch_name_prefix }.map{ |branch| branch[2..-1] }
      end

      # Transform branch names strings into branch objects.
      def transform_branch_names_to_maps(branch_names)
        current_branch_name = get_current_branch_name

        branch_names.map do |branch_name|
          {
            :name => branch_name,
            :active => (branch_name.eql? current_branch_name),
            :prod => (branch_name.eql? prod_branch_name)
          }
        end
      end

      # Transform branch names string into branch object.
      def transform_branch_name_to_map(branch_name)
        transform_branch_names_to_maps([branch_name]).first
      end

      # Create, checkout and push a new branch.
      def create_branch
        new_branch_name = draft_branch_name_prefix + (Time.now.utc.to_i.to_s)

        save_branch
        git_cmd("checkout #{prod_branch_name}")
        save_branch
        git_cmd("branch #{new_branch_name}")
        git_cmd("checkout #{new_branch_name}")
        git_cmd("push -u")

        transform_branch_name_to_map(new_branch_name)
      end

      # Pull, add, commit and push the current branch.
      def save_branch
        git_cmd("pull")
        git_cmd("add .")
        git_cmd("commit -m'Marketing site updated by admin.'")
        git_cmd("push")
      end

      # Save current branch, checkout new branch, pull and reset it.
      def load_branch(branch_name)
        save_branch

        git_cmd("checkout #{branch_name}")
        git_cmd("pull")
        git_cmd("git reset --hard HEAD")

        transform_branch_name_to_map(branch_name)
      end

      # Save current branch, checkout prod branch and merge in previous branch.
      def promote_branch
        save_branch
        promoted_branch_name = get_current_branch_name

        git_cmd("checkout #{prod_branch_name}")
        git_cmd("merge #{promoted_branch_name}")
        git_cmd("push")
        git_cmd("push -d origin #{promoted_branch_name}")
        git_cmd("branch -D #{promoted_branch_name}")

        transform_branch_name_to_map(prod_branch_name)
      end

      # Checkout prod branch and delete previous branch.
      def delete_branch
        save_branch
        deleted_branch_name = get_current_branch_name

        git_cmd("checkout #{prod_branch_name}")
        git_cmd("push -d origin #{deleted_branch_name}")
        git_cmd("branch -D #{deleted_branch_name}")

        transform_branch_name_to_map(prod_branch_name)
      end
    end
  end
end
