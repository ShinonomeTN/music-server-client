/* eslint-disable no-param-reassign */
const { defineConfig } = require('@vue/cli-service');
const path = require('path');

module.exports = defineConfig({
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
    },
  },
  devServer: {
    proxy: 'http://10.0.233.3:8054',
  },
  transpileDependencies: true,
  chainWebpack: (config) => {
    if (process.env.NODE_ENV === 'production') return;
    config.plugin('html')
      .tap((args) => {
        args[0].template = `${path.resolve(__dirname)}/public/dev_index.html`;
        return args;
      });
  },
});
