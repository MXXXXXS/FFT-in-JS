const path = require('path')

module.exports = {
  mode: "development",
  entry: './visualize.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  }
}