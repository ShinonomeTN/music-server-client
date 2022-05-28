export default [
  {
    path: 'admin/meta',
    name: 'AdminMetaManagement',
    component: () => import('@/views/AdminMetaManagement/AdminMetaManagement.vue'),
    meta: {
      requireScrollY: true,
    },
  },
];
