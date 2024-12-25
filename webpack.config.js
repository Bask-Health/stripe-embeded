const path = require('path');
const webpack = require('webpack'); // Add this line
const dotenv = require('dotenv'); // Import dotenv

// Load environment variables from the .env file
dotenv.config();

module.exports = {
  entry: './public/index.js', // Adjust based on your file structure
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'development',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.STRIPE_PUBLISHABLE_KEY': JSON.stringify(process.env.STRIPE_PUBLISHABLE_KEY),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
};
