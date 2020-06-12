const path = require('path');
module.exports = {
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    entry: './src/content/main.ts',
    output: {
        filename: 'content.js',
        path: path.resolve(__dirname, './'),
    }
};