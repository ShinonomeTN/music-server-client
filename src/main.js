import { createApp } from 'vue';
import globalWorker from '@/providers/global-worker';

import App from './App.vue';
import router from './router';
import store from './store';
import appConfig, { reloadNativeConfig } from './config';

import '@/common/stupid';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';

import 'bootstrap-icons/font/bootstrap-icons.css';
import './main.css';

window.onload = () => {
  if (!appConfig.isWeb) {
    document.body.classList.add('no-drag', 'no-select');
    reloadNativeConfig();
  }

  document.body.style.setProperty('--window-height', `${window.innerHeight}px`);
  window.onresize = () => {
    document.body.style.setProperty('--window-height', `${window.innerHeight}px`);
  };

  createApp(App).use(store).use(router).mount('#app');

  globalWorker.newWork(() => {
    store.dispatch('UserInfo/renewLoginSession').then(() => {
    }).catch((e) => {
      console.error('Session refresh failed.', e);
      store.commit('UserInfo/setLoggedIn', false);
    });
  }, 'Session Renew Work', true, 10000);

  globalWorker.start();
};
