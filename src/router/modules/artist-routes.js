export default [
  {
    path: '/artist',
    name: 'AllArtists',
    component: () => import('@/views/Main/Artist/AllArtistsView.vue'),
    meta: {
      navSection: 'AllArtists',
    },
  },
];
