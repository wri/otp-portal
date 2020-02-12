require('dotenv').load();

const withPlugins = require('next-compose-plugins');
const withSass = require('@zeit/next-sass');

const nextConfig = {
  env: {
    ENV: process.env.ENV,
    PORT: process.env.PORT,
    RW_API: process.env.RW_API,
    OTP_API: process.env.OTP_API,
    OTP_API_KEY: process.env.OTP_API_KEY,
    MAPBOX_API_KEY: process.env.MAPBOX_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY
  }
};

module.exports = withPlugins([
  [withSass]
], nextConfig);
