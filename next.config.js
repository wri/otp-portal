const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
require('dotenv').load();

module.exports = {
  webpack: (config, { dev }) => {
    config.module.rules.push(
      {
        test: /\.(css|scss)/,
        loader: 'emit-file-loader',
        options: {
          name: 'dist/[path][name].[ext]'
        }
      }
    ,
      {
        test: /\.css$/,
        use: ['babel-loader', 'raw-loader', 'postcss-loader']
      }
    ,
      {
        test: /\.s(a|c)ss$/,
        use: ['babel-loader', 'raw-loader', 'postcss-loader',
          { loader: 'sass-loader',
            options: {
              includePaths: ['css', 'node_modules']
                .map(d => path.join(__dirname, d))
                .map(g => glob.sync(g))
                .reduce((a, c) => a.concat(c), [])
            }
          }
        ]
      }
    );

    config.resolve.alias.components = path.join(__dirname, 'components');
    config.resolve.alias.constants = path.join(__dirname, 'constants');
    config.resolve.alias.css = path.join(__dirname, 'css');
    config.resolve.alias.hoc = path.join(__dirname, 'hoc');
    config.resolve.alias.lang = path.join(__dirname, 'lang');
    config.resolve.alias.modules = path.join(__dirname, 'modules');
    config.resolve.alias.selectors = path.join(__dirname, 'selectors');
    config.resolve.alias.services = path.join(__dirname, 'services');
    config.resolve.alias.store = path.join(__dirname, 'store');
    config.resolve.alias.utils = path.join(__dirname, 'utils');

    config.module.noParse = /(mapbox-gl)\.js$/;

    config.plugins = config.plugins.filter(
      plugin => (plugin.constructor.name !== 'UglifyJsPlugin')
    );

    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.ENV': JSON.stringify(process.env.ENV),
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'process.env.PORT': JSON.stringify(process.env.PORT),
        'process.env.RW_API': JSON.stringify(process.env.RW_API),
        'process.env.OTP_API': JSON.stringify(process.env.OTP_API),
        'process.env.OTP_API_KEY': JSON.stringify(process.env.OTP_API_KEY),
        'process.env.MAPBOX_API_KEY': JSON.stringify(process.env.MAPBOX_API_KEY),
        'process.env.GOOGLE_API_KEY': JSON.stringify(process.env.GOOGLE_API_KEY)
      })
    );

    return config;
  }
};
