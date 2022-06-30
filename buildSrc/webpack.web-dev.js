const base = require('./webpack.base');

module.exports = ((config) => {
  config.mode = 'development'

  config.devtool = 'cheap-module-eval-source-map'

  config.devServer = {
    host: 'localhost', // 主机名
    stats: 'errors-only', // 打包日志输出输出错误信息
    // port: 8081,
    open: true
  }

  return config;
})({ ...base });
