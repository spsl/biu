var path = require("path");

module.exports = {
    entry: {
        'biu': './src/index.js'
    },
    output: {
        filename: '[name].js',
        library: 'biu',
        path: path.resolve('./dist')
    },

    module: {
      loaders: [
        { test: /\.js$/,  loader: "babel-loader" }
      ]
    }
};


