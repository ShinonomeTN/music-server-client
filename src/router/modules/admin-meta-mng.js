export default [
  {
    path: 'admin/meta',
    name: 'AdminMetaManagement',
    redirect: '/admin/meta/recent',
    component: () => import('@/views/AdminMetaManagement/AdminMetaManagement.vue'),
    meta: {
      requireScrollY: true,
    },
    children: [
      {
        path: 'recent',
        name: 'AdminMetaManagementRecent',
        component: () => import('@/views/AdminMetaManagement/AdminRecentMetaView.vue'),
        meta: {
          requireRelative: true,
        },
      },
      {
        path: 'album',
        name: 'AdminAlbumCreate',
        component: () => import('@/views/AdminMetaManagement/AdminAlbumEdit.vue'),
        meta: {
          requireFlex: true,
        },
      },
      {
        path: 'album/[albumId]',
        name: 'AdminAlbumEdit',
        component: () => import('@/views/AdminMetaManagement/AdminAlbumEdit.vue'),
        props: true,
        meta: {
          requireRelative: true,
        },
      },
    ],
  },
];
