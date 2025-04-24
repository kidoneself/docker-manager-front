<template>
  <div class="install-container">
    <t-card :bordered="false">
      <!-- 应用信息 -->
      <div class="app-info">
        <div class="app-header">
          <h2 class="app-title">{{ appDetail?.name }}</h2>
          <p class="app-description">{{ appDetail?.description }}</p>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="main-content">
        <!-- 左侧参数配置 -->
        <div class="parameters-section">
          <div class="section-card">
            <h3 class="section-title">参数配置</h3>
            <t-alert theme="info" title="配置说明" class="config-alert">
              <template #message>
                <p>1. 当前显示的是默认参数配置，您可以根据需要修改</p>
                <p>2. 参数修改后请点击"校验参数"按钮进行验证</p>
                <p>3. 校验通过后即可开始安装</p>
              </template>
            </t-alert>

            <!-- 镜像信息 -->
            <div class="images-section">
              <h4 class="subsection-title">所需镜像</h4>
              <div class="images-list">
                <div v-for="service in appDetail?.services" :key="service.id" class="image-item">
                  <div class="image-info">
                    <span class="service-name">{{ service.name }}</span>
                    <t-tag theme="primary" variant="light" size="small">{{ service.template.Image }}</t-tag>
                  </div>
                </div>
              </div>
            </div>

            <t-form ref="form" :data="formData" :rules="rules" class="parameters-form">
              <div class="parameters-grid">
                <div v-for="param in appDetail?.parameters" :key="param.key" class="parameter-card">
                  <div class="parameter-header">
                    <span class="parameter-label">{{ param.name }}</span>
                    <t-tag theme="primary" variant="light" size="small">{{ param.key }}</t-tag>
                  </div>
                  <t-input
                    v-model="formData[param.key]"
                    :placeholder="param.value"
                    class="parameter-input"
                  />
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="action-buttons">
                <t-space>
                  <t-button
                    theme="primary"
                    :loading="isValidating"
                    :disabled="isValidating"
                    @click="handleValidate"
                  >
                    校验参数
                  </t-button>
                  <t-button
                    theme="primary"
                    :loading="isInstalling"
                    :disabled="isInstalling || !isValidated"
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
            </t-form>
          </div>
        </div>

        <!-- 右侧服务状态 -->
        <!-- <div class="service-status">
          <div class="section-card">
            <h3 class="section-title">服务状态</h3>
            <div class="status-list">
              <div v-for="service in appDetail?.services" :key="service.id" class="status-item">
                <div class="service-name">{{ service.name }}</div>
                <div class="service-status">
                  <t-tag :theme="getStatusTheme(service.status)">
                    {{ service.status }}
                  </t-tag>
                </div>
              </div>
            </div>
          </div>
        </div> -->
      </div>

      <!-- 校验结果 -->
      <div v-if="validationResult" class="validation-result">
        <t-alert
          :theme="validationResult.success ? 'success' : 'error'"
          :message="validationResult.message"
        />
      </div>

      <!-- 安装日志 -->
      <div v-if="isInstalling" class="install-log">
        <h3 class="section-title">安装日志</h3>
        <div class="log-content">
          <div v-for="(log, index) in installLogs" :key="index" class="log-item">
            <t-icon :name="getLogIcon(log.type)" class="log-icon" />
            <span class="log-message">{{ log.message }}</span>
            <span class="log-time">{{ log.time }}</span>
          </div>
        </div>
      </div>
    </t-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { getAppDetail } from '@/api/appStore';
import type { AppStoreAppDetail, ParameterConfig } from '@/api/model/appStoreModel';

const route = useRoute();
const router = useRouter();

// 应用详情
const appDetail = ref<AppStoreAppDetail>();
const formData = ref<Record<string, any>>({});
const isValidated = ref(false);
const validationResult = ref<{ success: boolean; message: string } | null>(null);

// 安装状态
const currentStep = ref(0);
const isInstalling = ref(false);
const isValidating = ref(false);

// 安装日志
const installLogs = ref([
  {
    type: 'info',
    message: '开始准备安装环境...',
    time: new Date().toLocaleTimeString(),
  },
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

// 表单校验规则
const rules = {
  // 动态生成校验规则
};

// 获取应用详情
const fetchAppDetail = async () => {
  try {
    const id = route.params.id as string;
    const res = await getAppDetail(id);
    
    if (res.code === 0) {
      appDetail.value = res.data;
      // 初始化表单数据
      if (appDetail.value?.parameters) {
        appDetail.value.parameters.forEach(param => {
          formData.value[param.key] = param.value;
        });
      }
    } else {
      MessagePlugin.error(res.message || '获取应用详情失败');
    }
  } catch (error) {
    console.error('获取应用详情失败:', error);
    MessagePlugin.error('获取应用详情失败');
  }
};

// 校验参数
const handleValidate = async () => {
  isValidating.value = true;
  try {
    const res = await fetch(`/api/app-store/validate/${route.params.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData.value),
    });
    
    const data = await res.json();
    validationResult.value = {
      success: data.success,
      message: data.message,
    };
    
    if (data.success) {
      isValidated.value = true;
      MessagePlugin.success('参数校验通过');
    } else {
      isValidated.value = false;
      MessagePlugin.error('参数校验失败');
    }
  } catch (error) {
    validationResult.value = {
      success: false,
      message: '参数校验失败',
    };
    isValidated.value = false;
    MessagePlugin.error('参数校验失败');
  } finally {
    isValidating.value = false;
  }
};

// 开始安装
const handleInstall = async () => {
  isInstalling.value = true;
  try {
    const res = await fetch(`/api/app-store/install/${route.params.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData.value),
    });
    
    if (res.ok) {
      MessagePlugin.success('开始安装...');
      // 模拟安装进度
      simulateInstallation();
    } else {
      const data = await res.json();
      MessagePlugin.error(data.message || '安装失败');
    }
  } catch (error) {
    MessagePlugin.error('安装失败');
  } finally {
    isInstalling.value = false;
  }
};

// 模拟安装进度
const simulateInstallation = () => {
  const steps = ['准备安装', '拉取镜像', '创建容器', '启动服务', '完成'];
  let currentIndex = 0;
  
  const interval = setInterval(() => {
    if (currentIndex < steps.length) {
      currentStep.value = currentIndex;
      installLogs.value.push({
        type: 'info',
        message: `正在${steps[currentIndex]}...`,
        time: new Date().toLocaleTimeString(),
      });
      currentIndex++;
    } else {
      clearInterval(interval);
      installLogs.value.push({
        type: 'success',
        message: '安装完成',
        time: new Date().toLocaleTimeString(),
      });
      MessagePlugin.success('安装完成');
      setTimeout(() => {
        router.push('/store');
      }, 2000);
    }
  }, 2000);
};

// 取消安装
const handleCancel = () => {
  router.back();
};

// 获取日志图标
const getLogIcon = (type: string) => {
  const icons: Record<string, string> = {
    info: 'info-circle',
    success: 'check-circle',
    warning: 'warning',
    error: 'error-circle',
  };
  return icons[type] || 'info-circle';
};

// 获取状态主题
// const getStatusTheme = (status: string) => {
//   const themes: Record<string, string> = {
//     '等待安装': 'default',
//     '安装中': 'warning',
//     '已完成': 'success',
//     '失败': 'danger',
//   };
//   return themes[status] || 'default';
// };

onMounted(() => {
  fetchAppDetail();
});
</script>

<style scoped>
.install-container {
  padding: 24px;
  height: 100%;
  width: 100%;
  background-color: var(--td-bg-color-page);
  display: flex;
  flex-direction: column;
}

.install-container :deep(.t-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.install-container :deep(.t-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
}

.app-info {
  border-bottom: 1px solid var(--td-component-stroke);
  padding-bottom: 16px;
}

.app-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.app-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.app-description {
  color: var(--td-text-color-secondary);
  margin: 0;
  flex: 1;
}

.main-content {
  display: flex;
  gap: 24px;
  min-height: 0;
}

.parameters-section {
  flex: 1;
  min-width: 0;
}

.section-card {
  background-color: var(--td-bg-color-container);
  border-radius: 8px;
  padding: 16px;
  box-shadow: var(--td-shadow-1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.info-icon {
  color: var(--td-text-color-secondary);
  font-size: 16px;
  cursor: help;
}

.parameters-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.parameters-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.parameter-card {
  background-color: var(--td-bg-color-secondarycontainer);
  border-radius: 6px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.parameter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.parameter-label {
  font-weight: 500;
  color: var(--td-text-color-primary);
  font-size: 14px;
}

.parameter-input {
  width: 100%;
}

.parameter-input :deep(.t-input) {
  background-color: var(--td-bg-color-container);
  height: 32px;
}

.parameter-input :deep(.t-input__inner) {
  font-size: 13px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--td-component-stroke);
}

.validation-result {
  margin: 0;
}

.install-log {
  background-color: var(--td-bg-color-container);
  border-radius: 8px;
  padding: 16px;
  box-shadow: var(--td-shadow-1);
}

.log-content {
  max-height: 200px;
  overflow-y: auto;
  padding: 16px;
  background-color: var(--td-bg-color-secondarycontainer);
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

/* 自定义滚动条样式 */
.status-list::-webkit-scrollbar,
.log-content::-webkit-scrollbar {
  width: 6px;
}

.status-list::-webkit-scrollbar-thumb,
.log-content::-webkit-scrollbar-thumb {
  background-color: var(--td-text-color-disabled);
  border-radius: 3px;
}

.status-list::-webkit-scrollbar-track,
.log-content::-webkit-scrollbar-track {
  background-color: transparent;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .parameters-form {
    padding: 16px;
  }
  
  .app-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

.config-alert {
  margin-bottom: 16px;
}

.config-alert :deep(.t-alert__message) {
  font-size: 13px;
  line-height: 1.6;
}

.config-alert :deep(.t-alert__message p) {
  margin: 4px 0;
}

.images-section {
  margin-bottom: 24px;
  padding: 16px;
  background-color: var(--td-bg-color-secondarycontainer);
  border-radius: 6px;
}

.subsection-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  margin: 0 0 12px;
}

.images-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: var(--td-bg-color-container);
  border-radius: 4px;
}

.image-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.service-name {
  font-weight: 500;
  color: var(--td-text-color-primary);
}
</style> 