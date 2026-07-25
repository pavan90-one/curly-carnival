module.exports = {
  port: Number(process.env.PORT) || 4006,
  accessSecret: process.env.ACCESS_TOKEN_SECRET || 'development-access-secret-change-me',
  refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'development-refresh-secret-change-me'
};
