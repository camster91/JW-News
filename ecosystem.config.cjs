module.exports = {
  apps: [{
    name: 'jw-news-parser',
    script: './index.js',
    instances: 1,
    autorestart: false,
    watch: false,
    max_memory_restart: '500M',
    cron_restart: '0 8 * * *', // Run daily at 8 AM
    env: {
      NODE_ENV: 'production'
    }
  }]
};
