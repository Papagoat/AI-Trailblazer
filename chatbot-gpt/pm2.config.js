module.exports = {
  apps : [{
    name      : 'api',
    script    : 'dist/chatbot.js',
    env : {
      DEPLOY_ENV: 'production',
      FRONTEND_ORIGIN: 'https://app-7xg5pjdonq-as.a.run.app',
      GOOGLE_APPLICATION_CREDENTIALS: 'gcp-compute-engine-service-acc-keys.json'
    }
  }],
}
