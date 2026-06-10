require_relative "boot"
require "rails/all"

Bundler.require(*Rails.groups)

module CheckersAiArena
  class Application < Rails::Application
    config.load_defaults 8.0
    config.api_only = true
    config.autoload_lib(ignore: %w[assets tasks]) if config.respond_to?(:autoload_lib)
  end
end
