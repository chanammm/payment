var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin'); 
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var [optimizecssassets,uglifyjs] = [require('optimize-css-assets-webpack-plugin'),require('uglifyjs-webpack-plugin')]

module.exports = {
    optimization:{  //优化项
        minimizer:[
            new uglifyjs({
                cache: false
            }),
            new optimizecssassets()
        ]
    },
    mode:'development',  //模式
    entry:{
        index:'./src/public/index.js',
        successfull: './src/public/successfull.js'
    },
    devServer:{
        port: 3000,
        progress: true,  //进度
        contentBase: './dist',
        compress: true
    },
    output:{
        filename:'[name]_23_aKvs-b8bW2Vg3fwHozO.js',
        path: path.resolve(__dirname, './src/dist/')
    },
    plugins:[
        new MiniCssExtractPlugin({
            template: './src/public/style.css',
            filename: 'stylesheets/_23_aKvs-b8bW2Vg3fwHozO.css'
        }),
        new HtmlWebpackPlugin({
            template: './src/views/payment.htm', 
            filename: 'index.htm',
            minify:{
                removeAttributeQuotes: true,  //去除 双引号
                collapseWhitespace: true   //加密
            },
            hash: true, //引入文件后面加哈希值
            chunks: ['index']
        }),
        new HtmlWebpackPlugin({
            template: './src/views/successfull.htm',
            filename: 'view/successfull.htm',
            minify:{
                removeAttributeQuotes: true,
                collapseWhitespace: true
            },
            hash: true,
            chunks:['successfull']
        })
    ],
    module:{
        rules:[
            {
                test: /\.css$/, use: [
                    {
                        loader: 'style-loader',
                        options:{
                            insertAt: 'top'  //出现在顶部
                        }
                    },
                    MiniCssExtractPlugin.loader, 
                    'css-loader'
                ]
            },
            {
                test: /\.js$/, use:{
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.(png|jpg|gif)$/,
                use:{
                    loader: 'url-loader',
                    options:{
                        limit: 10 * 1024,
                        outputPath: '../images/'
                    }
                }
            }
        ]
    }
}