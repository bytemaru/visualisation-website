const path = require('path');

module.exports = {
  entry: {
    index: './src/index.js',
    map: './src/map.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'development',
  devtool: "inline-source-map"
};