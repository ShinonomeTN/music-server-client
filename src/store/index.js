import { createStore } from 'vuex';

import appConfig from '@/config';
import {
  navBarAdministrationSection,
  navBarItem,
  navBarPublicSection,
  navBarSection,
} from '@/providers/nav-bar-factory';
import ServerInfo from './modules/server-info';
import UserInfo from './modules/user-info';

export default createStore({
  state: {
    title: 'Music Server Management',
    showTitleBar: false,
    navBarSections: [],
    navBarActivationKey: '',
  },
  getters: {
    showTitleBar(state) {
      return state.showTitleBar;
    },
    navBarSections(state) {
      return state.navBarSections;
    },
    windowTitle(state) {
      return state.title;
    },
    navBarActivationKey(state) {
      return state.navBarActivationKey;
    },
  },
  mutations: {
    setTitle(state, newTitle) {
      state.title = newTitle;
      if (appConfig.isWeb) document.title = newTitle;
    },
    setShowTitleBar(state, show) {
      state.showTitleBar = show;
    },
    setNavbarSections(state, newSections) {
      state.navBarSections.clear();
      state.navBarSections.addAll(newSections);
    },
    setNavBarActivationKey(state, newKey) {
      state.navBarActivationKey = newKey;
    },
  },
  actions: {
    async configureNavBar({ store, commit }) {
      const sections = [...navBarPublicSection()];
      sections.push(navBarSection('music-note-list', 'Playlists'));

      sections.push(...navBarAdministrationSection());
      commit('setNavbarSections', sections);
    },
  },
  modules: {
    ServerInfo,
    UserInfo,
  },
});
