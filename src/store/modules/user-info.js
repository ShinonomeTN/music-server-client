import api from '@/api';
import { $native } from '@/common/native';
import appConfig from '@/config';

console.log(api);

export default {
  namespaced: true,
  state: {
    userInfo: null,
    accessToken: api.config.storage.token,
    nextSessionRenew: 0,
    didLoggedIn: false,
  },
  getters: {
    /** @return {Object | null}  */ userInfo(state) {
      return state.userInfo;
    },

    /** @return {boolean}  */ didLoggedIn(state) {
      return state.didLoggedIn;
    },
  },
  mutations: {
    setUserInfo(state, /** @type {Object | null} */ userInfo) {
      state.userInfo = userInfo;
    },
    setLoggedIn(state, /** @type {boolean} */ newState) {
      state.didLoggedIn = newState;
    },
    setAccessToken(state, /** @type {string | null} */ newToken) {
      state.accessToken = newToken;
      api.config.storage.token = newToken;
    },
    refreshSessionRenewTime(state) {
      state.nextSessionRenew = (new Date()).getTime() + (1000 * 60 * 30);
    },
  },
  actions: {
    async fetchRemoteUserInfo({ commit }) {
      const data = await api.fetchRemoteUserInfo();
      const { user } = data.data;
      commit('setUserInfo', user);
      commit('setLoggedIn', true);
    },

    async serverAddressLoginIn({ commit }) {
      const query = new URLSearchParams();
      api.config.apiScopes.forEach((scope) => query.append('scope', scope));
      query.append('redirect', 'internal');
      const url = `${api.config.loginPageUrl()}?${query.toString()}`;
      const token = await $native('openLoginWindow', { url });
      commit('setAccessToken', token);
      commit('setLoggedIn', true);
      commit('refreshSessionRenewTime');
    },

    async usernamePasswordLogin({ commit }, { username, password }) {
      await api.auth_login({ username, password });
      commit('refreshSessionRenewTime');
      commit('setLoggedIn', true);
    },

    /**
     * Renew login session or access token
     * @returns {Promise<{exception: Error, message: string }|{message: string}>}
     */
    async renewLoginSession({ state, commit }) {
      const { didLoggedIn, nextSessionRenew } = state;
      if (!didLoggedIn) return { message: 'skip_did_not_login' };
      const current = (new Date()).getTime();
      if (current < nextSessionRenew) return { message: 'skip_no_need_to_refresh' };

      if (appConfig.isWeb) {
        await api.refreshSession();
        commit('refreshSessionRenewTime');
        return { message: 'session_refresh_success' };
      }

      const token = await api.refreshToken().then(({ data }) => data.token);
      commit('setAccessToken', token);
      commit('refreshSessionRenewTime');
      return { message: 'token_refresh_success' };
    },

    async logout({ commit }) {
      commit('setUserInfo', null);
      commit('setLoggedIn', false);
      commit('setAccessToken', null);
    },
  },
};
