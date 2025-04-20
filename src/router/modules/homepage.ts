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
      title: {
        zh_CN: '仪表盘',
        en_US: 'Dashboard',
      },
      icon: shallowRef(DashboardIcon),
      orderNo: 0,
    },
    children: [
      {
        path: 'base',
        name: 'DashboardBase',
        component: () => import('@/pages/dashboard/base/index.vue'),
        meta: {
          title: {
            zh_CN: '概览仪表盘',
            en_US: 'Overview',
          },
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
      title: {
        zh_CN: '外部页面',
        en_US: 'External',
      },
    },
    children: [
      {
        path: 'doc',
        name: 'Doc',
        component: IFrame,
        meta: {
          frameSrc: 'https://tdesign.tencent.com/starter/docs/vue-next/get-started',
          title: {
            zh_CN: '使用文档（内嵌）',
            en_US: 'Documentation(IFrame)',
          },
        },
      },
      {
        path: 'TDesign',
        name: 'TDesign',
        component: IFrame,
        meta: {
          frameSrc: 'https://tdesign.tencent.com/vue-next/getting-started',
          title: {
            zh_CN: 'TDesign 文档（内嵌）',
            en_US: 'TDesign (IFrame)',
          },
        },
      },
      {
        path: 'TDesign2',
        name: 'TDesign2',
        component: IFrame,
        meta: {
          frameSrc: 'https://tdesign.tencent.com/vue-next/getting-started',
          frameBlank: true,
          title: {
            zh_CN: 'TDesign 文档（外链',
            en_US: 'TDesign Doc(Link)',
          },
        },
      },
    ],
  },
];
