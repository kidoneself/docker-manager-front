<template>
  <div class="store-container">
    <t-card title="应用商店" class="store-card">
      <template #actions>
        <t-space>
          <t-input v-model="searchKeyword" placeholder="搜索应用" clearable>
            <template #prefix-icon>
              <t-icon name="search" />
            </template>
          </t-input>
        </t-space>
      </template>
      
      <t-row :gutter="[16, 16]">
        <t-col v-for="app in filteredApps" :key="app.id" :xs="12" :sm="8" :md="6" :lg="4">
          <t-card class="app-card" :bordered="true" hover-shadow>
            <template #cover>
              <img :src="app.icon" class="app-icon" :alt="app.name" />
            </template>
            <template #title>
              <div class="app-title">{{ app.name }}</div>
            </template>
            <template #description>
              <div class="app-description">{{ app.description }}</div>
            </template>
            <template #footer>
              <t-space>
                <t-button theme="primary" @click="handleInstall(app)">安装</t-button>
                <t-button variant="text" @click="handleViewDetail(app)">详情</t-button>
              </t-space>
            </template>
          </t-card>
        </t-col>
      </t-row>
    </t-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';

const router = useRouter();

// 模拟应用数据
const apps = ref([
  {
    id: 1,
    name: 'Nginx',
    description: '高性能的HTTP和反向代理web服务器',
    icon: 'https://nginx.org/nginx.png',
    version: '1.25.3',
  },
  {
    id: 2,
    name: 'MySQL',
    description: '流行的开源关系型数据库管理系统',
    icon: 'https://www.mysql.com/common/logos/logo-mysql-170x115.png',
    version: '8.0.33',
  },
  {
    id: 3,
    name: 'Redis',
    description: '高性能的key-value数据库',
    icon: 'https://redis.io/images/redis-white.png',
    version: '7.0.11',
  },
]);

const searchKeyword = ref('');

const filteredApps = computed(() => {
  if (!searchKeyword.value) return apps.value;
  return apps.value.filter(app => 
    app.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    app.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

const handleInstall = (app: any) => {
  MessagePlugin.success(`开始安装 ${app.name}...`);
  // TODO: 实现安装逻辑
};

const handleViewDetail = (app: any) => {
  router.push(`/store/detail/${app.id}`);
};
</script>

<style scoped>
.store-container {
  padding: 16px;
}

.store-card {
  margin-bottom: 16px;
}

.app-card {
  height: 100%;
}

.app-icon {
  width: 100%;
  height: 120px;
  object-fit: contain;
  padding: 16px;
}

.app-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}

.app-description {
  color: var(--td-text-color-secondary);
  font-size: 14px;
  margin-bottom: 16px;
}
</style> 