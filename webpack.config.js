const path = require('path')

const commonConfig = {
    output: {
        path: path.resolve(__dirname, 'src', 'main', 'resources'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)?$/,
                loader: 'ts-loader'
            },
            {
                test: /\.css$/,
                include: /(node_modules|src)/,
                loaders: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                loader: 'url-loader',
                options: {
                    limit: 10000
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx', '.jsx', '.json']
    }
}

module.exports = Object.assign({
    entry: {
        content: './src/main/typescript/content/content.ts'
    }
}, commonConfig);
