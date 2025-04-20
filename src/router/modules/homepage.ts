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
      {
        path: 'detail',
        name: 'DashboardDetail',
        component: () => import('@/pages/dashboard/detail/index.vue'),
        meta: {
          title: {
            zh_CN: '统计报表',
            en_US: 'Dashboard Detail',
          },
        },
      },
    ],
  },
  {
    path: '/list',
    component: Layout,
    redirect: '/list/base',
    name: 'list',
    meta: {
      title: {
        zh_CN: '列表页',
        en_US: 'List',
      },
      icon: shallowRef(DashboardIcon),
    },
    children: [
      {
        path: 'base',
        name: 'ListBase',
        component: () => import('@/pages/list/base/index.vue'),
        meta: {
          title: {
            zh_CN: '基础列表页',
            en_US: 'Base List',
          },
        },
      },
      {
        path: 'card',
        name: 'ListCard',
        component: () => import('@/pages/list/card/index.vue'),
        meta: {
          title: {
            zh_CN: '卡片列表页',
            en_US: 'Card List',
          },
        },
      },
      {
        path: 'filter',
        name: 'ListFilter',
        component: () => import('@/pages/list/filter/index.vue'),
        meta: {
          title: {
            zh_CN: '筛选列表页',
            en_US: 'Filter List',
          },
        },
      },
      {
        path: 'tree',
        name: 'ListTree',
        component: () => import('@/pages/list/tree/index.vue'),
        meta: {
          title: {
            zh_CN: '树状筛选列表页',
            en_US: 'Tree List',
          },
        },
      },
    ],
  },
  {
    path: '/form',
    name: 'form',
    component: Layout,
    redirect: '/form/base',
    meta: {
      title: {
        zh_CN: '表单页',
        en_US: 'Form',
      },
      icon: 'edit-1',
    },
    children: [
      {
        path: 'base',
        name: 'FormBase',
        component: () => import('@/pages/form/base/index.vue'),
        meta: {
          title: {
            zh_CN: '基础表单页',
            en_US: 'Base Form',
          },
        },
      },
      {
        path: 'step',
        name: 'FormStep',
        component: () => import('@/pages/form/step/index.vue'),
        meta: {
          title: {
            zh_CN: '分步表单页',
            en_US: 'Step Form',
          },
        },
      },
    ],
  },
  {
    path: '/detail',
    name: 'detail',
    component: Layout,
    redirect: '/detail/base',
    meta: {
      title: {
        zh_CN: '详情页',
        en_US: 'Detail',
      },
      icon: 'layers',
    },
    children: [
      {
        path: 'base',
        name: 'DetailBase',
        component: () => import('@/pages/detail/base/index.vue'),
        meta: {
          title: {
            zh_CN: '基础详情页',
            en_US: 'Base Detail',
          },
        },
      },
      {
        path: 'advanced',
        name: 'DetailAdvanced',
        component: () => import('@/pages/detail/advanced/index.vue'),
        meta: {
          title: {
            zh_CN: '多卡片详情页',
            en_US: 'Card Detail',
          },
        },
      },
      {
        path: 'deploy',
        name: 'DetailDeploy',
        component: () => import('@/pages/detail/deploy/index.vue'),
        meta: {
          title: {
            zh_CN: '数据详情页',
            en_US: 'Data Detail',
          },
        },
      },
      {
        path: 'secondary',
        name: 'DetailSecondary',
        component: () => import('@/pages/detail/secondary/index.vue'),
        meta: {
          title: {
            zh_CN: '二级详情页',
            en_US: 'Secondary Detail',
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
