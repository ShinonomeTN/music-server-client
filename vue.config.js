/* eslint-disable no-param-reassign */
const { defineConfig } = require('@vue/cli-service');
const path = require('path');

module.exports = defineConfig({
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      // https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/1432
      // chainWebpackMainProcess: (config) => {
      //   config.module.rule('babel').before('ts')
      //     .use('babel')
      //     .loader('babel-loader')
      //     .options({
      //       presets: [['@babel/preset-env', { modules: false }]],
      //       plugins: ['@babel/plugin-proposal-class-properties'],
      //     })
      //     .end()
      //     // https://stackoverflow.com/questions/34179496/error-with-mime-db-db-json-when-building-with-webpack
      //     .rule('json')
      //     .before('babel')
      //     .test('/\\.json$/')
      //     .use('json-loader')
      //     .loader('json-loader')
      //     .end();
      // },
    },
  },
  devServer: {
    proxy: 'https://audio.derjager.work',
  },
  transpileDependencies: true,
  chainWebpack: (config) => {
    if (process.env.NODE_ENV !== 'production') {
      config.plugin('html')
        .tap((args) => {
          args[0].template = `${path.resolve(__dirname)}/public/dev_index.html`;
          return args;
        });
    } else {
      config.plugin('html')
        .tap((args) => {
          args[0].template = `${path.resolve(__dirname)}/public/prod_index.html`;
          return args;
        });
    }
  },
});
