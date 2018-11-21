module JekyllAdmin
  class Server < Sinatra::Base
    # include JekyllAdmin::PathHelper

    namespace "/version" do

      get "/update" do
        if git_repo
          update_files
        end
        json({ :commit => commit_id })
      end

      get "/publish/*?/?:path.:ext" do
        if git_repo
          publish_file path
        end
        json({ :commit => commit_id, :path => path })
      end

      private

      # Get site source directory.
      def src_dir
        @src_dir ||= JekyllAdmin.site.source
      end

      # Get the src git repo instance.
      def git_repo
        begin
          @git_repo ||= Git.open(JekyllAdmin.site.source) #, :log => Jekyll.logger)
        rescue ArgumentError
          Jekyll.logger.warn "Not a git repo: " + $!.message
          @git_repo ||= true
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

      # Get the current commit ID.
      def commit_id
        git_cmd("rev-parse HEAD").first
      end

      # Update the branch.
      def update_files
        git_cmd("pull -s recursive -X ours")
      end

      # Add and push the specified file.
      def publish_file(path)
        git_cmd("pull -s recursive -X ours")
        git_cmd("add #{path}")
        git_cmd("commit -m'Marketing updated #{path}'")
        git_cmd("push")
      end
    end
  end
end
