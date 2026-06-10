Rails.application.routes.draw do
  get "/health", to: "health#show"
  get "/up", to: "health#show"

  namespace :api do
    namespace :v1 do
      resources :games, only: [:index, :create, :show] do
        member do
          post :play
          post :finish
        end
      end

      namespace :ai do
        resource :stats, only: [:show]
        resources :training_events, only: [:create]
        resources :snapshots, only: [:create] do
          collection do
            get :latest
            delete :destroy_all
          end
        end
      end
    end
  end
end
