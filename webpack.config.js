var webpack = require('webpack');

module.exports = {
    output: {
        path: './web_dist',
        filename: 'take.js',
        libraryTarget: 'umd',
        library: 'take'
    },
    plugins: [
        new webpack.dependencies.LabeledModulesPlugin()
    ]
};
