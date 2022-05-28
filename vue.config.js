const { defineConfig } = require('@vue/cli-service');

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
});
