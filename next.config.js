const path = require('path');
const glob = require('glob');
const webpack = require('webpack');

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

    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.PORT': JSON.stringify(process.env.PORT),
        'process.env.OTP_API': JSON.stringify(process.env.OTP_API),
        'process.env.OTP_API_KEY': JSON.stringify(process.env.OTP_API_KEY),
        'process.env.BASEMAP_LABEL_URL': JSON.stringify(process.env.BASEMAP_LABEL_URL),
        'process.env.BASEMAP_TILE_URL': JSON.stringify(process.env.BASEMAP_TILE_URL),
        'process.env.MAPBOX_API_KEY': JSON.stringify(process.env.MAPBOX_API_KEY)
      })
    );

    return config;
  }
};
