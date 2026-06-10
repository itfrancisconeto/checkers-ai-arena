Rails.application.configure do
  config.enable_reloading = true
  config.eager_load = false
  config.consider_all_requests_local = true
  config.server_timing = true
  config.active_record.migration_error = :page_load
  config.active_record.verbose_query_logs = true
  config.active_record.query_log_tags_enabled = true


  # Permite que o frontend (Vite) acesse a API pelo nome do serviço Docker `backend`
  # durante o desenvolvimento. Sem isso, Rails 8 bloqueia chamadas proxied com
  # Host: backend:3000 e retorna HTTP 403 (Blocked hosts: backend:3000).
  config.hosts.clear
end
