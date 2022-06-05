export default [
  {
    path: 'admin/meta',
    name: 'AdminMetaManagement',
    redirect: '/admin/meta/recent',
    component: () => import('@/views/AdminMetaManagement/AdminMetaManagement.vue'),
    meta: {
      requireScrollY: true,
      navSection: 'AdminMetaManagement',
    },
    children: [
      {
        path: 'recent',
        name: 'AdminMetaManagementRecent',
        component: () => import('@/views/AdminMetaManagement/AdminRecentMetaView.vue'),
        meta: {
          requireRelative: true,
          navSection: 'AdminMetaManagement',
        },
      },
      {
        path: 'album',
        name: 'AdminAlbumCreate',
        component: () => import('@/views/AdminMetaManagement/AdminAlbumEdit.vue'),
        meta: {
          requireFlex: true,
          navSection: 'AdminMetaManagement',
        },
      },
      {
        path: 'album/:albumId',
        name: 'AdminAlbumEdit',
        component: () => import('@/views/AdminMetaManagement/AdminAlbumEdit.vue'),
        props: true,
        meta: {
          requireFlex: true,
          navSection: 'AdminMetaManagement',
        },
      },
    ],
  },
];
