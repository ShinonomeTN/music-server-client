import { createStore } from 'vuex';

import { navBarAdministrationSection, navBarPublicSection } from '@/providers/nav-bar-factory';

import appConfig from '@/config';

import ServerInfo from './modules/server-info';
import UserInfo from './modules/user-info';
import UserPlaylist from './modules/user-playlist';
import GlobalModal from './modules/global-modal';

const getters = {
  showTitleBar(state) {
    return state.showTitleBar;
  },
  navBarPublicSections(state) {
    return state.navBarPublicSections;
  },
  navBarAdministrationSections(state) {
    return state.navBarAdministrationSections;
  },
  windowTitle(state) {
    return state.title;
  },
  navBarActivationKey(state) {
    return state.navBarActivationKey;
  },
};

const mutations = {
  setTitle(state, newTitle) {
    state.title = newTitle;
    if (appConfig.isWeb) document.title = newTitle;
  },
  setShowTitleBar(state, show) {
    state.showTitleBar = show;
  },
  setNavBarActivationKey(state, newKey) {
    state.navBarActivationKey = newKey;
  },
};

const actions = {
  async configureNavBar({ state }) {
    state.navBarPublicSections.clear();
    state.navBarPublicSections.addAll(navBarPublicSection());

    state.navBarAdministrationSections.clear();
    state.navBarAdministrationSections.addAll(navBarAdministrationSection());
  },
};

const state = {
  title: 'Music Server Management',
  showTitleBar: false,
  navBarSections: [],
  navBarPublicSections: [],
  navBarPlaylistSections: [],
  navBarAdministrationSections: [],
  navBarActivationKey: '',
};

export default createStore({
  state,
  getters,
  mutations,
  actions,
  modules: {
    ServerInfo,
    UserInfo,
    UserPlaylist,
    GlobalModal,
  },
});
