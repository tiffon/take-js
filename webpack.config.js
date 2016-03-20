var webpack = require('webpack');

module.exports = {
    output: {
        path: './umd',
        filename: 'take.js',
        libraryTarget: 'umd',
        library: 'take'
    },
    loaders: [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel'
        }
    ],
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        })
    ]
};
