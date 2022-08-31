require('dotenv').load();

module.exports = {
  env: {
    ENV: process.env.ENV,
    PORT: process.env.PORT,
    RW_API: process.env.RW_API,
    GFW_API: process.env.GFW_API,
    OTP_API: process.env.OTP_API,
    OTP_API_KEY: process.env.OTP_API_KEY,
    OTP_COUNTRIES: process.env.OTP_COUNTRIES.split(','),
    OTP_COUNTRIES_IDS: process.env.OTP_COUNTRIES_IDS.split(','),
    MAPBOX_API_KEY: process.env.MAPBOX_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    DOCUMENTS_MINDATE: process.env.DOCUMENTS_MINDATE,
    FEATURE_COUNTRY_PAGES: process.env.FEATURE_COUNTRY_PAGES,
    FEATURE_MAP_PAGE: process.env.FEATURE_MAP_PAGE,
  },
};
