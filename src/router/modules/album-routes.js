export default [
  {
    path: '/album',
    name: 'AllAlbums',
    component: () => import('@/views/Main/Album/AllAlbumView.vue'),
    meta: {
      requireRelative: true,
    },
  },
];
