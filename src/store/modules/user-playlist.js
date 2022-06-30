import api from '@/api';

/** @typedef { 'loading'  | 'success' | 'error' } PlaylistLoadingState */

export default {
  namespaced: true,
  state: {
    recentPlaylists: [],
    playlistCount: 0,
    /** @type PlaylistLoadingState */
    status: 'loading',
  },
  getters: {
    /** @return { PlaylistLoadingState }  */
    status(state) {
      return state.isLoading;
    },
    recentPlaylists(state) {
      return state.recentPlaylists;
    },
    playlistCount(state) {
      return state.playlistCount;
    },
  },
  mutations: {
    setRecentPlaylists(state, playlists) {
      state.recentPlaylists.clear();
      state.recentPlaylists.addAll(playlists);
    },
    setPlaylistCount(state, count) {
      state.playlistCount = count;
    },
    /** @param { PlaylistLoadingState } status */
    setStatus(state, status) {
      state.status = status;
    },
  },
  actions: {
    async updateRecentPlaylists({ commit }) {
      commit('setStatus', 'loading');
      try {
        const page = await api.playlist_listAll();
        commit('setRecentPlaylists', page.content);
        commit('setPlaylistCount', page.total);
        commit('setStatus', 'success');
      } catch (e) {
        console.error('Load user recent playlist failed.', e);
        commit('setStatus', 'error');
      }
    },
  },
};
