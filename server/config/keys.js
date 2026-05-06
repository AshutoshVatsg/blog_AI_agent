module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  AI_API_KEY: process.env.AI_API_KEY,
  AI_API_URL: process.env.AI_API_URL,
  NODE_ENV: process.env.NODE_ENV || 'development',
};
