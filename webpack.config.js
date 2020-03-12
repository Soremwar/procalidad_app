module.exports = {
  // 1
  entry: './components/App.jsx',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  // 2
  output: {
    path: __dirname + '/public/resources',
    publicPath: '/public/resources',
    filename: 'app.js'
  },
  devServer: {
    contentBase: __dirname + '/public/resources',
    compress: true,
    port: 3000,
  }
};