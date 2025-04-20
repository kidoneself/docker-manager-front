import { DashboardIcon } from 'tdesign-icons-vue-next';
import { shallowRef } from 'vue';
import Layout from '@/layouts/index.vue';
import IFrame from '@/layouts/frame/index.vue';

export default [
  {
    path: '/dashboard',
    component: Layout,
    redirect: '/dashboard/base',
    name: 'dashboard',
    meta: {
      title: '仪表盘',
      icon: shallowRef(DashboardIcon),
      orderNo: 0,
    },
    children: [
      {
        path: 'base',
        name: 'DashboardBase',
        component: () => import('@/pages/dashboard/base/index.vue'),
        meta: {
          title: '概览仪表盘',
        },
      },
    ],
  },

  {
    path: '/frame',
    name: 'Frame',
    component: Layout,
    redirect: '/frame/doc',
    meta: {
      icon: 'internet',
      title: '外部页面',
      orderNo: 10,
    },
    children: [
      {
        path: 'doc',
        name: 'Doc',
        component: IFrame,
        meta: {
          frameSrc: 'https://naspt.vip',
          title: '使用文档（内嵌）',
        },
      },
      {
        path: 'TDesign',
        name: 'TDesign',
        component: IFrame,
        meta: {
          frameSrc: 'https://pan.naspt.vip',
          title: '资源下载网盘（内嵌）',
        },
      },
      {
        path: 'TDesign2',
        name: 'TDesign2',
        component: IFrame,
        meta: {
          frameSrc: 'https://pan.naspt.vip',
          frameBlank: true,
          title: '资源下载网盘（外链）',
        },
      },
    ],
  },
];
