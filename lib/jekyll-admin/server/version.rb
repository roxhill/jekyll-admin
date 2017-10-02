module JekyllAdmin
  class Server < Sinatra::Base
    include JekyllAdmin::PathHelper

    PRODUCTION_BRANCH = "marketing"
    DRAFT_BRANCH_PREFIX = "marketing-draft-"

    namespace "/version" do

      get "/list" do
        begin
          json(list_branches)
        rescue ArgumentError
          json([])
        end
      end

      get "/create" do
        json(create_branch)
      end

      get "/save" do
        json(save_branch)
      end

      get "/load" do
        version = params[:version]
        json(load_branch(version))
      end

      get "/promote" do
        json(promote_branch)
      end

      get "/delete" do
        json(delete_branch)
      end

      private

      def open_repo
        begin
          Git.open(JekyllAdmin.site.source, :log => Jekyll.logger)
          #Git.open('~/Work/everlution/projects/roxhill-marketing', :log => Jekyll.logger)
        rescue ArgumentError
          Jekyll.logger.warn "Not a git repo: " + $!.message
          raise
        end
      end

      # 'List' all versions by filter branch list.
      def list_branches
        # [
        #   { :name => 'marketing', :active => false, :prod => true},
        #   { :name => 'marketing-1234', :active => true, :prod => false},
        #   { :name => 'marketing-5678', :active => false, :prod => false}
        # ]
        g = open_repo
        branches = g.branches.local.select{ |branch| branch.name.include? "marketing" }
        branches.map do |branch|
            {
                :name => branch.name,
                :active => (branch.name.eql? g.current_branch.name),
                :prod => (branch.name.eql? PRODUCTION_BRANCH)
            }
        end
      end

      # 'Create' a version by creating a draft branch off site prod branch.
      def create_branch
        new_branch_name = DRAFT_BRANCH_PREFIX + (Time.now.utc.to_i.to_s)
        g = open_repo

        g.branch(PRODUCTION_BRANCH).checkout
        g.branch(new_branch_name).create
        g.branch(new_branch_name).checkout
        #g.push

        {
            :name => g.current_branch,
            :active => true,
            :prod => false
        }
      end

      # 'Save' a version by adding all in current branch and commiting.
      def save_branch
        g = open_repo

        begin
          g.add(:all=>true)
          g.commit("Site updated by admin.")
          #g.push
        rescue Git::GitExecuteError
          Jekyll.logger.warn "No changes to save: " + $!.message
        end

        {
            :name => g.current_branch,
            :active => true,
            :prod => (g.current_branch == PRODUCTION_BRANCH)
        }
      end

      # 'Load' a version by saving current branch and checking out another branch.
      def load_branch(branch_name)
        save_branch
        g = open_repo
        g.branch(branch_name).checkout

        {
            :name => g.current_branch,
            :active => true,
            :prod => (g.current_branch == PRODUCTION_BRANCH)
        }
      end

      # 'Promote' a version by merging it into site prod branch.
      def promote_branch
        save_branch
        g = open_repo

        branch_name = g.current_branch
        g.branch(PRODUCTION_BRANCH).checkout
        g.merge(branch_name)
        #g.push

        {
            :name => g.current_branch,
            :active => true,
            :prod => true
        }
      end

      def delete_branch
        save_branch
        g = open_repo
        branch_name = g.current_branch
        g.branch(PRODUCTION_BRANCH).checkout
        g.branch(branch_name).delete
        #g.push

        {
            :name => g.current_branch,
            :active => true,
            :prod => true
        }
      end
    end
  end
end
