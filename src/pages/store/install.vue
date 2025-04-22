<template>
  <div class="install-container">
    <t-card :bordered="false">
      <!-- 安装进度 -->
      <div class="install-progress">
        <t-steps :current="currentStep" theme="dot">
          <t-step-item title="准备安装" content="正在准备安装环境" />
          <t-step-item title="拉取镜像" content="正在下载所需镜像" />
          <t-step-item title="创建容器" content="正在创建并配置容器" />
          <t-step-item title="启动服务" content="正在启动服务" />
          <t-step-item title="完成" content="安装完成" />
        </t-steps>
      </div>

      <!-- 安装日志 -->
      <div class="install-log">
        <t-card title="安装日志" :bordered="false">
          <div class="log-content">
            <div v-for="(log, index) in installLogs" :key="index" class="log-item">
              <t-icon :name="getLogIcon(log.type)" class="log-icon" />
              <span class="log-message">{{ log.message }}</span>
              <span class="log-time">{{ log.time }}</span>
            </div>
          </div>
        </t-card>
      </div>

      <!-- 服务状态 -->
      <div class="service-status">
        <h3 class="section-title">服务状态</h3>
        <t-table :data="serviceStatus" :columns="statusColumns">
          <template #status="{ row }">
            <t-tag :theme="getStatusTheme(row.status)">
              {{ row.status }}
            </t-tag>
          </template>
        </t-table>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <t-space>
          <t-button
            theme="primary"
            :loading="isInstalling"
            :disabled="isInstalling"
            @click="handleInstall"
          >
            开始安装
          </t-button>
          <t-button
            variant="text"
            :disabled="isInstalling"
            @click="handleCancel"
          >
            取消
          </t-button>
        </t-space>
      </div>
    </t-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';

const route = useRoute();
const router = useRouter();

// 安装步骤
const currentStep = ref(0);
const isInstalling = ref(false);

// 安装日志
const installLogs = ref([
  {
    type: 'info',
    message: '开始准备安装环境...',
    time: new Date().toLocaleTimeString(),
  },
  // 更多日志...
]);

// 服务状态
const serviceStatus = ref([
  {
    name: 'Transmission',
    status: '等待安装',
    progress: 0,
  },
  {
    name: 'Emby',
    status: '等待安装',
    progress: 0,
  },
  // 更多服务...
]);

// 表格列配置
const statusColumns = [
  { colKey: 'name', title: '服务名称' },
  { colKey: 'status', title: '状态' },
  { colKey: 'progress', title: '进度' },
];

// 获取日志图标
const getLogIcon = (type: string) => {
  const icons = {
    info: 'info-circle',
    success: 'check-circle',
    warning: 'warning',
    error: 'error-circle',
  };
  return icons[type] || 'info-circle';
};

// 获取状态主题
const getStatusTheme = (status: string) => {
  const themes = {
    '等待安装': 'default',
    '安装中': 'warning',
    '已完成': 'success',
    '失败': 'danger',
  };
  return themes[status] || 'default';
};

// 开始安装
const handleInstall = async () => {
  isInstalling.value = true;
  try {
    // TODO: 调用后端API开始安装
    MessagePlugin.success('开始安装...');
  } catch (error) {
    MessagePlugin.error('安装失败');
  } finally {
    isInstalling.value = false;
  }
};

// 取消安装
const handleCancel = () => {
  router.back();
};

onMounted(() => {
  // TODO: 根据路由参数获取安装信息
  const appId = route.params.id;
  console.log('加载安装信息:', appId);
});
</script>

<style scoped>
.install-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.install-progress {
  margin-bottom: 32px;
}

.install-log {
  margin-bottom: 32px;
}

.log-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
  background-color: var(--td-bg-color-container);
  border-radius: 4px;
}

.log-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--td-component-stroke);
}

.log-item:last-child {
  border-bottom: none;
}

.log-icon {
  margin-right: 8px;
  font-size: 16px;
}

.log-message {
  flex: 1;
  font-size: 14px;
}

.log-time {
  color: var(--td-text-color-secondary);
  font-size: 12px;
}

.service-status {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style> 