var webpack = require('webpack');

module.exports = {
    entry: "./index",
    output: {
        path: './web_dist',
        filename: 'take.js',
        libraryTarget: 'umd',
        library: 'take'
    }
};
