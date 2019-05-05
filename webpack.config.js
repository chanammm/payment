var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin'); 
var MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode:'development',  //模式
    entry:'./src/public/index.js',
    output:{
        filename:'_23_aKvs-b8bW2Vg3fwHozO.js',
        path: path.resolve(__dirname, './src/dist')
    },
    plugins:[
        new HtmlWebpackPlugin({
            template: './src/views/payment.htm', 
            filename: 'index.htm',
            minify:{
                removeAttributeQuotes: true,  //去除 双引号
                collapseWhitespace: true   //加密
            },
            hash: true, //引入文件后面加哈希值
        }),
        new MiniCssExtractPlugin({
            template: './src/public/style.css',
            filename: '_23_aKvs-b8bW2Vg3fwHozO.css'
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
            }
        ]
    }
}