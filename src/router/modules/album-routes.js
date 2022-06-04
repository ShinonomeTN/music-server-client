export default [
  {
    path: '/album',
    name: 'AllAlbums',
    component: () => import('@/views/Main/Album/AllAlbumView.vue'),
    meta: {
      requireRelative: true,
      navSection: 'AllAlbums',
    },
  },
  {
    path: '/album/:albumId(\\d+)',
    name: 'AlbumView',
    component: () => import('@/views/Main/Album/AlbumView.vue'),
    props: true,
    meta: {
      requireFlex: true,
      navSection: 'AllAlbums',
    },
  },
];
