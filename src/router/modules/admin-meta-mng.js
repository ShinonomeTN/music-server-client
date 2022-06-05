export default [
  {
    path: 'admin/meta',
    name: 'AdminMetaManagement',
    redirect: '/admin/meta/recent',
    meta: {
      requireScrollY: true,
      navSection: 'AdminMetaManagement',
      navRootSection: true,
    },
  },
  {
    path: '/admin/meta/recent',
    name: 'AdminMetaManagementRecent',
    component: () => import('@/views/AdminMetaManagement/AdminRecentMetaView.vue'),
    meta: {
      requireRelative: true,
      navSection: 'AdminMetaManagement',
    },
  },
  {
    path: '/admin/meta/album',
    name: 'AdminAlbumCreate',
    component: () => import('@/views/AdminMetaManagement/AdminAlbumEdit.vue'),
    meta: {
      requireFlex: true,
      navSection: 'AdminMetaManagement',
    },
  },
  {
    path: '/admin/meta/album/:albumId',
    name: 'AdminAlbumEdit',
    component: () => import('@/views/AdminMetaManagement/AdminAlbumEdit.vue'),
    props: true,
    meta: {
      requireFlex: true,
      navSection: 'AdminMetaManagement',
    },
  },
];
