<template>
  <div class="detail-container">
    <t-card class="detail-card">
      <template #title>
        <t-space align="center">
          <img :src="appDetail.icon" class="detail-icon" :alt="appDetail.name" />
          <div>
            <h2 class="detail-title">{{ appDetail.name }}</h2>
            <t-tag theme="primary" variant="light">{{ appDetail.version }}</t-tag>
          </div>
        </t-space>
      </template>

      <t-tabs v-model="activeTab">
        <t-tab-panel value="overview" label="概览">
          <div class="tab-content">
            <p class="description">{{ appDetail.description }}</p>
            <t-divider />
            <h3>基本信息</h3>
            <t-descriptions :column="2" bordered>
              <t-descriptions-item label="应用名称">{{ appDetail.name }}</t-descriptions-item>
              <t-descriptions-item label="版本">{{ appDetail.version }}</t-descriptions-item>
              <t-descriptions-item label="大小">{{ appDetail.size }}</t-descriptions-item>
              <t-descriptions-item label="更新时间">{{ appDetail.updateTime }}</t-descriptions-item>
              <t-descriptions-item label="开发者">{{ appDetail.developer }}</t-descriptions-item>
              <t-descriptions-item label="许可证">{{ appDetail.license }}</t-descriptions-item>
            </t-descriptions>
          </div>
        </t-tab-panel>
        <t-tab-panel value="config" label="配置说明">
          <div class="tab-content">
            <h3>环境要求</h3>
            <t-descriptions :column="1" bordered>
              <t-descriptions-item label="操作系统">{{ appDetail.requirements.os }}</t-descriptions-item>
              <t-descriptions-item label="CPU">{{ appDetail.requirements.cpu }}</t-descriptions-item>
              <t-descriptions-item label="内存">{{ appDetail.requirements.memory }}</t-descriptions-item>
              <t-descriptions-item label="磁盘空间">{{ appDetail.requirements.disk }}</t-descriptions-item>
            </t-descriptions>
            <t-divider />
            <h3>配置参数</h3>
            <t-table :data="appDetail.configs" :columns="configColumns" />
          </div>
        </t-tab-panel>
        <t-tab-panel value="docs" label="文档">
          <div class="tab-content">
            <t-collapse>
              <t-collapse-panel header="快速开始" value="quickstart">
                <div v-html="appDetail.docs.quickstart"></div>
              </t-collapse-panel>
              <t-collapse-panel header="详细配置" value="configuration">
                <div v-html="appDetail.docs.configuration"></div>
              </t-collapse-panel>
              <t-collapse-panel header="常见问题" value="faq">
                <div v-html="appDetail.docs.faq"></div>
              </t-collapse-panel>
            </t-collapse>
          </div>
        </t-tab-panel>
      </t-tabs>

      <template #footer>
        <t-space>
          <t-button theme="primary" @click="handleInstall">安装</t-button>
          <t-button variant="text" @click="handleBack">返回</t-button>
        </t-space>
      </template>
    </t-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';

const route = useRoute();
const router = useRouter();
const activeTab = ref('overview');

// 模拟应用详情数据
const appDetail = ref({
  id: 1,
  name: 'Nginx',
  description: 'Nginx 是一个高性能的 HTTP 和反向代理 web 服务器，同时也提供了 IMAP/POP3/SMTP 服务。',
  icon: 'https://nginx.org/nginx.png',
  version: '1.25.3',
  size: '2.5MB',
  updateTime: '2024-03-15',
  developer: 'Nginx Inc.',
  license: 'BSD-2-Clause',
  requirements: {
    os: 'Linux/Windows/macOS',
    cpu: '1核以上',
    memory: '512MB以上',
    disk: '100MB以上',
  },
  configs: [
    {
      key: 'port',
      description: '监听端口',
      type: 'number',
      default: '80',
      required: true,
    },
    {
      key: 'worker_processes',
      description: '工作进程数',
      type: 'number',
      default: 'auto',
      required: false,
    },
  ],
  docs: {
    quickstart: `
      <h4>快速安装</h4>
      <p>1. 下载并解压 Nginx</p>
      <p>2. 运行安装命令</p>
      <p>3. 启动服务</p>
    `,
    configuration: `
      <h4>配置文件说明</h4>
      <p>主要配置文件位于 /etc/nginx/nginx.conf</p>
      <p>虚拟主机配置位于 /etc/nginx/conf.d/</p>
    `,
    faq: `
      <h4>常见问题</h4>
      <p>Q: 如何修改监听端口？</p>
      <p>A: 在配置文件中修改 listen 指令</p>
    `,
  },
});

const configColumns = [
  { colKey: 'key', title: '参数名' },
  { colKey: 'description', title: '说明' },
  { colKey: 'type', title: '类型' },
  { colKey: 'default', title: '默认值' },
  { colKey: 'required', title: '是否必填' },
];

const handleInstall = () => {
  router.push(`/store/install/${appDetail.value.id}`);
};

const handleBack = () => {
  router.back();
};

onMounted(() => {
  // TODO: 根据路由参数获取应用详情
  const appId = route.params.id;
  console.log('加载应用详情:', appId);
});
</script>

<style scoped>
.detail-container {
  padding: 16px;
}

.detail-card {
  margin-bottom: 16px;
}

.detail-icon {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.detail-title {
  margin: 0;
  font-size: 24px;
}

.tab-content {
  padding: 16px;
}

.description {
  color: var(--td-text-color-secondary);
  line-height: 1.6;
  margin-bottom: 16px;
}

h3 {
  margin-top: 0;
  margin-bottom: 16px;
}
</style> 