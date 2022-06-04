export default [
  {
    path: '/admin/server',
    name: 'AdminServerStatus',
    redirect: '/admin/server/info',
    component: () => import('@/views/AdminServerStatus/AdminServerStatus.vue'),
    children: [
      {
        path: 'info',
        name: 'AdminServerInformation',
        component: () => import('@/views/AdminServerStatus/AdminServerInformation.vue'),
        meta: {
          navSection: 'AdminServerStatus',
        },
      },
    ],
  },
];
