import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';

import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';

import store from '@/store';

import appConfig from '@/config';

import ArtistRoutes from './modules/artist-routes';
import AlbumRoutes from './modules/album-routes';
import TrackRoutes from './modules/track-routes';
import AdminMetaManagementRoute from './modules/admin-meta-mng';
import AdminServerStatus from './modules/admin-server-status';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    redirect: '/dash',
    children: [
      {
        path: '/dash',
        name: 'DefaultView',
        component: () => import('@/views/Main/DefaultView.vue'),
      },
      ...ArtistRoutes,
      ...AlbumRoutes,
      ...TrackRoutes,
      ...AdminMetaManagementRoute,
      ...AdminServerStatus,
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: {
      guestView: true,
    },
  },
];

const router = createRouter({
  history: (() => {
    switch (appConfig.appMode) {
      case 'webpage':
        return createWebHistory();
      default:
        return createWebHashHistory();
    }
  })(),

  routes,
});

function handleLoginCheck(meta, from, next) {
  if (!store.getters['UserInfo/didLoggedIn'] && from.name !== 'Login') return next({ name: 'Login' });
  return next();
}

function computeNavBarActivationKey(to) {
  let key = '';
  const { matched } = to;
  if (!matched.isEmpty()) {
    const [first, second] = matched;
    const selected = (second || first);
    const { meta } = selected || {};
    const name = meta.navSection || selected.name;
    if (name) key = `route_name:${name}`;
  }
  store.commit('setNavBarActivationKey', key);
}

router.beforeEach((to, from, next) => {
  computeNavBarActivationKey(to);
  const { meta } = to;
  if (!meta) return next();
  const { guestView, title } = meta;
  store.commit('setTitle', title || 'Music Server Management');
  if (guestView) return next();
  return handleLoginCheck(meta, from, next);
});

export default router;
