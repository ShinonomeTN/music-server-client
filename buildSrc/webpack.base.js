const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const{ VueLoaderPlugin } = require('vue-loader');
const webpack = require('webpack');
const sass = require('sass-loader')

function resolve (dir) {
  return path.resolve(__dirname, '..', dir)
}

const javascript = () => ([{
  test: /\.js$/,
  exclude: /node_modules/,
  loader: 'babel-loader'
}])

const files = () => ([
  {
    test: /\.(png|svg|jpg|gif)$/,
    use: [
      {
        loader: 'file-loader',
        options: {
          limit: 5000,
          name: 'img/[hash].[ext]'
        }
      }
    ]
  }
])

const vue = () => ([
  {
    test: /\.vue$/,
    use: 'vue-loader',
  }
])

const stylesheet = () => ([
  {
    test: /\.css$/,
    use: ['style-loader', 'css-loader']
  },
  {
    test: /\.(scss|sass)$/,
    use: [
      'style-loader',
      'css-loader',
      {
        loader: 'sass-loader',
        options: {
          implementation: sass,
          sassOptions: {
            fiber: Fiber,
          }
        }
      },
      'postcss-loader'
    ]
  }
])

const typescript = () => ([{
  test: /\.tsx?$/,
  use: 'ts-loader',
  include: [resolve('src')]
}])

//
// Plugin configuration
//
const plugins = [
  new HtmlWebpackPlugin({
    template: path.resolve(__dirname, './public/index.html'),
    filename: 'index.html',
  }),
  new VueLoaderPlugin(),
  new CleanWebpackPlugin(),
  new webpack.HashedModuleIdsPlugin()
]

//
// Webpack module
//
export default {
  entry: './src/main.ts',
  output: {
    path: resolve('dist'),
    filename: '[name].[contenthash:8].js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  modules: {
    rules: [
      ...javascript(),
      ...vue(),
      ...files(),
      ...stylesheet(),
      ...typescript(),
    ],
  },
  plugins,
};
