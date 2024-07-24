const { withSentryConfig } = require('@sentry/nextjs');

require('dotenv').config();

const config = {
  env: {
    ENV: process.env.ENV,
    PORT: process.env.PORT,
    APP_URL: process.env.APP_URL,
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
    SENTRY_DSN: process.env.SENTRY_DSN,
    GOOGLE_TAG_MANAGER_KEY: process.env.GOOGLE_TAG_MANAGER_KEY,
    OSANO_ID: process.env.OSANO_ID,
    DISABLE_HOTJAR: process.env.DISABLE_HOTJAR
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: "/**"
      },
    ],
  },
  i18n: {
    locales: ['en', 'fr', 'pt', 'zh', 'ja', 'ko', 'vi'],
    defaultLocale: 'en'
  },
  sentry: {
    ...(process.env.SENTRY_DISABLE_RELEASE && {
      disableServerWebpackPlugin: true,
      disableClientWebpackPlugin: true
    })
  },
  async redirects() {
    return [
      {
        source: '/operators/:id',
        destination: '/operators/:id/overview',
        permanent: true
      },
      {
        source: '/countries/:id',
        destination: '/countries/:id/overview',
        permanent: true
      },
      {
        source: '/help',
        destination: '/help/overview',
        permanent: true
      },
    ]
  }
  /* productionBrowserSourceMaps: true, // for debugging prod build locally */
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

if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: true
  })
  module.exports = withBundleAnalyzer(withSentryConfig(config, sentryWebpackPluginOptions));
} else {
  // Make sure adding Sentry options is the last code to run before exporting, to
  // ensure that your source maps include changes from all other Webpack plugins
  module.exports = withSentryConfig(config, sentryWebpackPluginOptions);
}

