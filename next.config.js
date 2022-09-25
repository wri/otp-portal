const { withSentryConfig } = require('@sentry/nextjs');

require('dotenv').load();

const config = {
  env: {
    ENV: process.env.ENV,
    PORT: process.env.PORT,
    RW_API: process.env.RW_API,
    OTP_API: process.env.OTP_API,
    OTP_API_KEY: process.env.OTP_API_KEY,
    OTP_COUNTRIES: process.env.OTP_COUNTRIES.split(','),
    OTP_COUNTRIES_IDS: process.env.OTP_COUNTRIES_IDS.split(','),
    MAPBOX_API_KEY: process.env.MAPBOX_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    DOCUMENTS_MINDATE: process.env.DOCUMENTS_MINDATE,
    FEATURE_COUNTRY_PAGES: process.env.FEATURE_COUNTRY_PAGES,
    FEATURE_MAP_PAGE: process.env.FEATURE_MAP_PAGE,
    SENTRY_DSN: process.env.SENTRY_DSN
  },
};

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(config, sentryWebpackPluginOptions);
