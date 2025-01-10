const zlib = require("zlib");
const { withSentryConfig } = require('@sentry/nextjs');
const webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');

require('dotenv').config();

if (!process.env.SECRET) throw new Error('Missing session SECRET')

const config = {
  // only PUBLIC env variables here (accessible on the client side)
  env: {
    ENV: process.env.ENV,
    PORT: process.env.PORT,
    APP_URL: process.env.APP_URL,
    RW_API: process.env.RW_API,
    GFW_PROXY_API: process.env.APP_URL + "/gfw-data-api",
    OTP_API: process.env.OTP_API,
    OTP_API_KEY: process.env.OTP_API_KEY,
    OTP_COUNTRIES: process.env.OTP_COUNTRIES,
    OTP_COUNTRIES_IDS: process.env.OTP_COUNTRIES_IDS,
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
  compress: false, // NGINX will handle this with dynamic compression and better algorithms, static assets compressed with webpack plugin (not all)
  webpack: (config, options) => {
    // config.infrastructureLogging = {
    //   level: 'verbose',
    // }
    config.plugins.push(
      new webpack.DefinePlugin({
        __SENTRY_DEBUG__: false,
        __SENTRY_TRACING__: false, // Tracing, we don't use it
        __RRWEB_EXCLUDE_IFRAME__: true,  // Session Replay - we don't use it
        __RRWEB_EXCLUDE_SHADOW_DOM__: true, // Session Replay - we don't use it
        __SENTRY_EXCLUDE_REPLAY_WORKER__: true, // Session Replay - we don't use it
      })
    );

    if (!options.dev) {
      new CompressionPlugin({
        filename: "[path][base].br",
        algorithm: "brotliCompress",
        test: /\.(js|css|html|svg)$/,
        compressionOptions: {
          params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
          },
        },
        threshold: 5120,
        minRatio: 0.8,
      });
    }

    // if (!options.dev) {
    //   config.resolve.alias = {
    //     ...config.resolve.alias,
    //     '@formatjs/icu-messageformat-parser': '@formatjs/icu-messageformat-parser/no-parser'
    //   };
    // }

    return config
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
  },
  async rewrites() {
    return [
      {
        source: "/gfw-data-api/:path*",
        destination: "/api/gfw-data/:path*",
      },
      {
        source: "/portal-api/:path*",
        destination: "/api/portal/:path*",
      }
    ];
  },
  experimental: {
    optimizePackageImports: ["modules"]
  }
};

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true, // Suppresses all logs
  hideSourceMaps: process.env.ENV === 'production',
  widenClientFileUpload: true,
  ...(process.env.SENTRY_DISABLE_RELEASE === 'true' && {
    release: {
      create: false,
      finalize: false,
    }
  })
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

