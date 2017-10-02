module JekyllAdmin
  class Server < Sinatra::Base
    include JekyllAdmin::PathHelper

    namespace "/version" do
      get "/publish" do
        Jekyll.logger.debug "Publishing changes..."
        commit_changes
        json({
          :status     => 'ok',
        })
      end

      private

      def commit_changes
        begin
          g = Git.open(JekyllAdmin.site.source, :log => Jekyll.logger)
          g.pull
          g.add(:all=>true)
          g.commit("Site updated by admin.")
          #g.push
          Jekyll.logger.debug "Changes published."
        rescue ArgumentError
          Jekyll.logger.warn "Not a git repo: " + $!.message
        end
      end
    end
  end
end
