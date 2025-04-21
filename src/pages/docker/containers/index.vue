<!-- 容器管理页面 -->
<template>
  <div class="container">
    <t-card>
      <!-- 页面头部，包含标题和刷新按钮 -->
      <div class="header">
        <div class="title">容器列表</div>
        <t-button @click="handleRefresh">
          <template #icon>
            <t-icon name="refresh" />
          </template>
          刷新列表
        </t-button>
      </div>
      <!-- 容器列表 -->
      <t-list :split="true">
        <!-- 遍历显示每个容器 -->
        <t-list-item v-for="container in containers" :key="container.Id">
          <div class="container-item">
            <!-- 容器基本信息 -->
            <div class="container-info">
              <t-list-item-meta
                :title="container.Names?.[0]?.replace('/', '') || '未设置'"
                :description="container.Image || '未设置'"
              >
                <!-- 容器头像，显示首字母 -->
                <template #image>
                  <div class="container-logo-wrapper">
                    <img
                      v-if="getContainerLogo(container.Image, container.Id, showInitial)"
                      :src="getContainerLogo(container.Image, container.Id, showInitial)"
                      :alt="container.Image"
                      class="container-logo"
                      @error="handleImageError(container.Id)"
                    />
                    <div
                      v-else
                      class="container-initial"
                      :style="{ backgroundColor: getStatusColor(container.State as ContainerState) }"
                    >
                      {{ getContainerInitial(container.Names?.[0]) }}
                    </div>
                  </div>
                </template>
              </t-list-item-meta>
            </div>
            <!-- 容器操作按钮 -->
            <div class="container-actions">
              <t-space>
                <!-- 容器状态标签 -->
                <t-tag :theme="getStatusTheme(container.State as ContainerState)" variant="light">
                  <template #icon>
                    <t-icon :name="getStatusIcon(container.State as ContainerState)" />
                  </template>
                  {{ getStatusText(container.State as ContainerState) }}
                </t-tag>
                <!-- 启动/停止按钮 -->
                <t-button
                  :theme="container.State === 'running' ? 'warning' : 'success'"
                  :loading="isContainerOperating(container.Id)"
                  :disabled="isContainerOperating(container.Id)"
                  @click="container.State === 'running' ? handleStop(container) : handleStart(container)"
                >
                  <template #icon>
                    <t-icon :name="container.State === 'running' ? 'stop' : 'play'" />
                  </template>
                  {{ container.State === 'running' ? '停止' : '启动' }}
                </t-button>
                <!-- 重启按钮 -->
                <t-button
                  theme="primary"
                  :loading="isContainerOperating(container.Id)"
                  :disabled="isContainerOperating(container.Id)"
                  @click="handleRestart(container)"
                >
                  <template #icon>
                    <t-icon name="refresh" />
                  </template>
                  重启
                </t-button>
                <!-- 删除按钮 -->
                <t-button theme="danger" :disabled="container.State === 'running'" @click="handleDelete(container)">
                  <template #icon>
                    <t-icon name="delete" />
                  </template>
                  删除
                </t-button>
                <!-- 查看日志按钮 -->
                <t-button theme="default" @click="handleShowLogs(container)">
                  <template #icon>
                    <t-icon name="file" />
                  </template>
                  日志
                </t-button>
                <!-- 详情按钮 -->
                <t-button theme="default" @click="handleShowDetails(container)">
                  <template #icon>
                    <t-icon name="info-circle" />
                  </template>
                  详情
                </t-button>
              </t-space>
            </div>
          </div>
        </t-list-item>
      </t-list>
    </t-card>

    <!-- 日志查看对话框 -->
    <t-dialog
      v-model:visible="logsDialogVisible"
      :header="'容器日志 - ' + currentLogsContainer?.Names?.[0]?.replace('/', '')"
      :footer="false"
      width="800px"
      class="logs-dialog"
      :close-on-overlay-click="false"
      @close="handleCloseLogs"
    >
      <t-card>
        <div class="logs-content">
          <!-- 日志工具栏 -->
          <div class="logs-toolbar">
            <t-space>
              <!-- 实时跟踪开关 -->
              <t-switch #label v-model="logsFollow">实时跟踪</t-switch>
              <!-- 轮询状态指示器 -->
              <!-- <div v-if="logsFollow" class="polling-indicator">
                <t-icon v-if="isLogsLoading" name="loading" class="loading-icon"/>
                <span>正在更新...</span>
              </div> -->
            </t-space>
            <!-- 刷新日志按钮 -->
            <t-button theme="primary" @click="refreshLogs" :loading="isLogsLoading">
              <template #icon>
                <t-icon name="refresh" />
              </template>
              刷新
            </t-button>
          </div>
          <!-- 日志内容显示区域 -->
          <t-card ref="logsTextRef" class="logs-text">
            <pre v-html="logsContent"></pre>
          </t-card>
        </div>
      </t-card>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { nextTick, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  Container,
  deleteContainer,
  getContainerList,
  getContainerLogs,
  restartContainer,
  startContainer,
  stopContainer,
} from '@/api/container';
import { getContainerLogo } from '@/constants/container-logos';
import {
  ContainerOperationState,
  ContainerState,
  getContainerInitial,
  getStatusColor,
  getStatusIcon,
  getStatusText,
  getStatusTheme,
  handleContainerOperation,
} from './utils';

const router = useRouter();

// 响应式数据定义
const containers = ref<Container[]>([]); // 容器列表
const operatingContainers = ref<ContainerOperationState>({
  starting: new Set(),
  stopping: new Set(),
  restarting: new Set(),
});
const showInitial = ref<Set<string>>(new Set()); // 显示首字母的容器ID集合

// 日志相关状态
const logsDialogVisible = ref(false); // 日志对话框显示状态
const currentLogsContainer = ref<Container | null>(null); // 当前查看日志的容器
const logsContent = ref(''); // 日志内容
const logsFollow = ref(false); // 是否实时跟踪
const logsTextRef = ref<HTMLElement | null>(null); // 日志文本区域引用
const logsPollingTimer = ref<number | null>(null); // 轮询定时器
const isLogsLoading = ref(false); // 是否正在请求日志

/**
 * 检查容器是否正在操作
 */
const isContainerOperating = (containerId: string) => {
  return Object.values(operatingContainers.value).some((set) => set.has(containerId));
};

/**
 * 解析 ANSI 颜色代码
 */
const parseAnsiColors = (text: string) => {
  const ansiRegex = /\x1b\[([0-9;]+)m/g;
  return text.replace(ansiRegex, (match, codes) => {
    const style = codes.split(';').reduce((acc: string, code: string) => {
      const styleMap: Record<string, string> = {
        '0': '',
        '1': 'font-weight: bold;',
        '30': 'color: black;',
        '31': 'color: red;',
        '32': 'color: green;',
        '33': 'color: yellow;',
        '34': 'color: blue;',
        '35': 'color: magenta;',
        '36': 'color: cyan;',
        '37': 'color: white;',
        '40': 'background-color: black;',
        '41': 'background-color: red;',
        '42': 'background-color: green;',
        '43': 'background-color: yellow;',
        '44': 'background-color: blue;',
        '45': 'background-color: magenta;',
        '46': 'background-color: cyan;',
        '47': 'background-color: white;',
      };
      return acc + (styleMap[code] || '');
    }, '');
    return style ? `<span style="${style}">` : '</span>';
  });
};

/**
 * 开始轮询日志
 */
const startLogsPolling = () => {
  if (logsPollingTimer.value) {
    clearInterval(logsPollingTimer.value);
  }
  if (logsFollow.value) {
    logsPollingTimer.value = window.setInterval(refreshLogs, 2000);
  }
};

/**
 * 停止轮询日志
 */
const stopLogsPolling = () => {
  if (logsPollingTimer.value) {
    clearInterval(logsPollingTimer.value);
    logsPollingTimer.value = null;
  }
};

/**
 * 关闭日志对话框
 */
const handleCloseLogs = () => {
  stopLogsPolling();
  logsFollow.value = false;
  isLogsLoading.value = false;
  currentLogsContainer.value = null;
  logsContent.value = '';
};

/**
 * 刷新日志内容
 */
const refreshLogs = async () => {
  if (!currentLogsContainer.value) return;

  try {
    isLogsLoading.value = true;
    const response = await getContainerLogs(currentLogsContainer.value.Id, {
      tail: 100,
      follow: false,
      timestamps: false,
    });
    logsContent.value = parseAnsiColors(response.data);

    nextTick(() => {
      const logsElement = logsTextRef.value?.querySelector('pre');
      if (logsElement) {
        logsElement.scrollTop = logsElement.scrollHeight;
      }
    });
  } catch (error) {
    MessagePlugin.error('获取容器日志失败');
  } finally {
    isLogsLoading.value = false;
  }
};

/**
 * 显示容器日志
 */
const handleShowLogs = async (container: Container) => {
  currentLogsContainer.value = container;
  logsDialogVisible.value = true;
  await refreshLogs();
  if (logsFollow.value) {
    startLogsPolling();
  }
};

/**
 * 显示容器详情
 */
const handleShowDetails = (container: Container) => {
  router.push({
    path: '/docker/containers/detail',
    query: { id: container.Id },
  });
};

/**
 * 获取容器列表
 */
const fetchContainers = async () => {
  try {
    const response = await getContainerList();
    containers.value = response.map((container: Container) => ({
      ...container,
      Names: container.Names?.map((name) => name.replace('/', '')) || [],
    }));
  } catch (error) {
    MessagePlugin.error('获取容器列表失败');
  }
};

/**
 * 刷新容器列表
 */
const handleRefresh = () => {
  fetchContainers();
};

/**
 * 启动容器
 */
const handleStart = async (container: Container) => {
  operatingContainers.value.starting.add(container.Id);
  await handleContainerOperation(
    async () => {
      await startContainer(container.Id);
      await fetchContainers();
    },
    '启动容器成功',
    '启动容器失败',
  );
  operatingContainers.value.starting.delete(container.Id);
};

/**
 * 停止容器
 */
const handleStop = async (container: Container) => {
  operatingContainers.value.stopping.add(container.Id);
  await handleContainerOperation(
    async () => {
      await stopContainer(container.Id);
      await fetchContainers();
    },
    '停止容器成功',
    '停止容器失败',
  );
  operatingContainers.value.stopping.delete(container.Id);
};

/**
 * 重启容器
 */
const handleRestart = async (container: Container) => {
  operatingContainers.value.restarting.add(container.Id);
  await handleContainerOperation(
    async () => {
      await restartContainer(container.Id);
      await fetchContainers();
    },
    '重启容器成功',
    '重启容器失败',
  );
  operatingContainers.value.restarting.delete(container.Id);
};

/**
 * 删除容器
 */
const handleDelete = async (container: Container) => {
  await handleContainerOperation(
    async () => {
      await deleteContainer(container.Id);
      await fetchContainers();
    },
    '删除容器成功',
    '删除容器失败',
  );
};

/**
 * 处理图片加载错误
 */
const handleImageError = (containerId: string) => {
  showInitial.value.add(containerId);
};

// 监听实时跟踪状态变化
watch(logsFollow, (newVal) => {
  if (newVal) {
    startLogsPolling();
  } else {
    stopLogsPolling();
  }
});

// 监听对话框关闭
watch(logsDialogVisible, (newVal) => {
  if (!newVal) {
    handleCloseLogs();
  }
});

// 组件挂载时获取容器列表
onMounted(() => {
  fetchContainers();
});
</script>

<style scoped>
/* 主容器样式 */
.container {
  padding: 20px;
}

/* 页面头部样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* 标题样式 */
.title {
  font-size: 20px;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

/* 容器列表项样式 */
.container-item {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 20px;
  padding: 0 20px;
}

/* 容器信息区域样式 */
.container-info {
  flex: 1;
  min-width: 200px;
}

/* 容器操作按钮区域样式 */
.container-actions {
  width: 420px;
  display: flex;
  justify-content: flex-end;
}

/* 日志对话框样式 */
.logs-dialog {
  max-height: 80vh;
}

/* 日志内容区域样式 */
.logs-content {
  display: flex;
  flex-direction: column;
  height: 60vh;
}

/* 日志工具栏样式 */
.logs-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

/* 轮询状态指示器样式 */
.polling-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--td-text-color-secondary);
  font-size: 14px;
}

.loading-icon {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 日志文本区域样式 */
.logs-text {
  flex: 1;
  overflow-y: auto;
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: var(--td-radius-medium);
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: calc(60vh - 100px);
}

/* 日志文本预格式化样式 */
.logs-text pre {
  margin: 0;
  padding: 0;
  line-height: 1.5;
}

/* 日志文本中的 span 标签样式 */
.logs-text pre span {
  display: inline;
}

/* 容器首字母样式 */
.container-initial {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 20px;
}

/* 容器 logo 包装器样式 */
.container-logo-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 容器 logo 样式 */
.container-logo {
  width: 200%;
  height: 200%;
  object-fit: contain;
  transform: scale(1);
  transform-origin: center;
}

/* 列表项头像样式 */
:deep(.t-list-item__meta-avatar) {
  width: 48px;
  height: 48px;
}
</style>
