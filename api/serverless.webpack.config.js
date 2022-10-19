/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const slsw = require('serverless-webpack')
const nodeExternals = require('webpack-node-externals')
const CopyPlugin = require("copy-webpack-plugin");
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: slsw.lib.entries,
  target: 'node',
  resolve: {
    extensions: ['.mjs', '.ts', '.js'],
    plugins: [ new TsconfigPathsPlugin() ]
  },
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js'
  },
  externals: [nodeExternals()],
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "migrations", to: "migrations" },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader'
      }
    ]
  }
}