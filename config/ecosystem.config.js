module.exports = {
  apps: [{
    name: 'wongram-shop',
    script: './server/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    node_args: '--max-old-space-size=512',
    restart_delay: 1000,
    max_restarts: 10,
    min_uptime: '10s',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      SITE_URL: 'https://wongram.shop'
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3000,
      SITE_URL: 'http://localhost:3000'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    cron_restart: '0 2 * * *',
    ignore_watch: ['node_modules', 'logs', 'public/uploads', '.git'],
    env_file: '.env'
  }]
};
