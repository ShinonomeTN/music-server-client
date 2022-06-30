const base = require('./webpack.base');

module.exports = ((config) => {
  config.mode = 'production'

  config.devtool = 'cheap-module-source-map'

  return config;
})({ ...base });
