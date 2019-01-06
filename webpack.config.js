const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const path = require('path');
const nodeExternals = require('webpack-node-externals');

const target = process.env.npm_lifecycle_event;

module.exports = {
  entry: {
    index: path.resolve(__dirname, 'src/'),
  },
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: '[name].js',
    sourceMapFilename: '[file].map',
    libraryTarget: 'umd',
  },
  target: 'node',
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        use: 'babel-loader',
      },
      {
        test: /\.(graphqls?|gql)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'raw-loader',
          },
        ],
      },
    ],
  },
  plugins: [target === 'bundle' ? new BundleAnalyzerPlugin() : null].filter(Boolean),
};
