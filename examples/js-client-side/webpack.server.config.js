const path = require('path')
const webpack = require('webpack')
const dotenv = require('dotenv').config({
  path: path.join(__dirname, '.env'),
})
const nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: {
    server: './src/server/server.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].js',
  },
  target: 'node',
  devtool: 'source-map',
  node: {
    // Need this when working with express, otherwise the build fails
    // if you don't put this is, __dirname and __filename return blank or /
    __dirname: false,
    __filename: false,
  },
  externals: [nodeExternals()], // Need this to avoid error when working with Express
  module: {
    rules: [
      {
        // Transpiles ES6-8 into ES5
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),
  ],
}
