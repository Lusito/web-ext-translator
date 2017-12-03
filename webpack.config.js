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
            },
            // {
            //     test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
            //     loader: 'svg-url-loader',
            //     query: {
            //         limit: '10000',
            //         mimetype: 'application/svg+xml'
            //     }
            // }
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
