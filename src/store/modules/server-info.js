import api from '@/api';
import { BusinessError } from '@/common/business-error';
import appConfig from '@/config';

export default {
  namespaced: true,
  state: {
    serverInfo: {},
    serverUrl: api.config.storage.serverUrl,
  },
  getters: {
    serverInfo(state) {
      return state.serverInfo;
    },
    serverUrl(state) {
      return state.serverUrl;
    },
  },
  mutations: {
    setServerInfo(state, /** @type { Object | null } */ serverInfo) {
      state.serverInfo = serverInfo;
    },
    setServerAddress(state, /** @type { String | null } */ serverAddress) {
      state.serverUrl = serverAddress;
      api.config.storage.serverUrl = serverAddress;
    },
  },
  actions: {
    async fetchServerInfo({ commit }, { serverAddress }) {
      const serverInfo = await api.fetchRemoteServerInfo(serverAddress);
      commit('setServerInfo', serverInfo);
      commit('setServerAddress', serverAddress);
    },
    async updateServerInfo({ state, commit }) {
      if (appConfig.isWeb) {
        const serverInfo = await api.fetchCurrentServerInfo();
        commit('setServerInfo', serverInfo);
        return;
      }
      const { serverUrl } = state;
      if (serverUrl === null) throw new BusinessError({ error: 'could_not_fetch_server_info', message: 'server_url_not_set' });
      const serverInfo = await api.fetchRemoteServerInfo(serverUrl);
      commit('setServerInfo', serverInfo);
    },
  },
};
