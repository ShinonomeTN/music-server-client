export default [
  {
    path: '/admin/server',
    name: 'AdminServerStatus',
    redirect: '/admin/server/info',
  },
  {
    path: '/admin/server/info',
    name: 'AdminServerInformation',
    component: () => import('@/views/AdminServerStatus/AdminServerInformation.vue'),
    meta: {
      navSection: 'AdminServerStatus',
    },
  },
];
