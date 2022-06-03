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
    proxy: 'http://192.168.1.153:8054',
  },
  transpileDependencies: true,
  chainWebpack: (config) => {
    if (process.env.NODE_ENV !== 'production') config.plugin('html')
      .tap((args) => {
        args[0].template = `${path.resolve(__dirname)}/public/dev_index.html`;
        return args;
      });
    else config.plugin('html')
      .tap((args) => {
        args[0].template = `${path.resolve(__dirname)}/public/prod_index.html`;
        return args;
      });
  },
});
