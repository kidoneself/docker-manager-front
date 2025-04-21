<template>
  <div class="container">
    <div class="header">
      <div class="title">镜像列表</div>
      <div class="actions">
        <t-button theme="primary" @click="handleRegistry">
          <template #icon>
            <t-icon name="server" />
          </template>
          仓库管理
        </t-button>
        <t-button theme="primary" @click="handlePull">
          <template #icon>
            <t-icon name="add" />
          </template>
          拉取镜像
        </t-button>
        <t-button theme="warning" @click="handleCheckUpdates">
          <template #icon>
            <t-icon name="swap" />
          </template>
          检查更新
        </t-button>
        <t-button theme="success" @click="handleBatchUpdate">
          <template #icon>
            <t-icon name="refresh" />
          </template>
          批量更新
        </t-button>
        <t-button @click="handleTestProxy">
          <template #icon>
            <t-icon name="time" />
          </template>
          测试代理延迟
        </t-button>
        <t-button @click="fetchImages">
          <template #icon>
            <t-icon name="refresh" />
          </template>
          刷新
        </t-button>
      </div>
    </div>

    <!-- 添加代理测试结果对话框 -->
    <t-dialog v-model:visible="proxyTestDialogVisible" header="代理延迟测试结果" :close-on-overlay-click="false">
      <div v-if="proxyTestResult" class="proxy-test-result">
        <t-alert theme="info" message="测试目标: Docker Hub (registry-1.docker.io)" />
        <div class="test-metrics">
          <div class="metric-item">
            <span class="metric-label">HTTP延迟时间:</span>
            <span class="metric-value">{{ proxyTestResult.httpConnectTime }}ms</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">HTTPS延迟时间:</span>
            <span class="metric-value">{{ proxyTestResult.httpsConnectTime }}ms</span>
          </div>
        </div>
        <t-alert :theme="getProxyTestAlertTheme()" :message="getProxyTestSuggestion()" />
      </div>
      <div v-else class="proxy-test-loading">
        <t-loading text="正在测试代理延迟..." />
      </div>
    </t-dialog>

    <!-- 添加正在拉取的镜像列表 -->
    <div v-if="activePullTasks.length > 0" class="pulling-images-section">
      <div class="section-title">正在拉取的镜像</div>
      <t-table :data="activePullTasks" :columns="pullTaskColumns" row-key="taskId">
        <template #image="{ row }">
          <t-tag theme="primary">{{ row.image }}:{{ row.tag }}</t-tag>
        </template>
        <template #progress="{ row }">
          <div class="inline-progress">
            <t-progress :percentage="row.progress" :stroke-width="4" :show-label="false" />
            <span class="progress-text">{{ row.progress }}%</span>
          </div>
        </template>
        <template #status="{ row }">
          <t-tag :theme="getTaskStatusTheme(row.status)" variant="light">
            {{ getTaskStatusText(row.status) }}
          </t-tag>
        </template>
        <template #operation="{ row }">
          <t-space>
            <t-button size="small" @click="showPullTaskDetails(row)">查看详情</t-button>
            <t-button
              v-if="row.status !== 'success' && row.status !== 'error'"
              size="small"
              theme="danger"
              @click="handleCancelPullTask(row)"
              >取消
            </t-button>
          </t-space>
        </template>
      </t-table>
    </div>

    <t-table :data="images" :columns="columns" :loading="loading" row-key="Id">
      <template #id="{ row }">
        <t-tag theme="default" variant="light">{{ row.Id.slice(0, 12) }}</t-tag>
      </template>
      <template #name="{ row }">
        <t-tag theme="primary" variant="light">{{ row.name }}</t-tag>
      </template>
      <template #tag="{ row }">
        <t-tag theme="warning" variant="light">{{ row.tag }}</t-tag>
      </template>
      <template #size="{ row }">
        <span>{{ formatSize(row.size) }}</span>
      </template>
      <template #created="{ row }">
        <span>{{ formatDate(row.created) }}</span>
      </template>
      <template #needUpdate="{ row }">
        <t-tag :theme="row.needUpdate ? 'warning' : 'success'" variant="light">
          <template #icon>
            <t-icon :name="row.needUpdate ? 'time' : 'check-circle'" />
          </template>
          {{ row.needUpdate ? '需要更新' : '已是最新' }}
        </t-tag>
      </template>
      <template #lastChecked="{ row }">
        <span>{{ row.lastChecked ? formatDate(row.lastChecked) : '尚未检查' }}</span>
      </template>
      <template #operation="{ row }">
        <t-space size="small">
          <t-tooltip content="创建容器">
            <t-button size="small" shape="circle" variant="outline" theme="primary" @click="handleRun(row)">
              <template #icon>
                <t-icon name="play" />
              </template>
            </t-button>
          </t-tooltip>
          <t-tooltip v-if="row.needUpdate" content="更新镜像">
            <t-button size="small" shape="circle" theme="warning" @click="handleUpdate(row)">
              <template #icon>
                <t-icon name="refresh" />
              </template>
            </t-button>
          </t-tooltip>
          <t-tooltip content="删除镜像">
            <t-button size="small" shape="circle" theme="danger" @click="handleDelete(row)">
              <template #icon>
                <t-icon name="delete" />
              </template>
            </t-button>
          </t-tooltip>
        </t-space>
      </template>
    </t-table>

    <!-- 仓库管理对话框 -->
    <t-dialog v-model:visible="registryDialogVisible" header="仓库管理" :close-on-overlay-click="false" width="800px">
      <div class="registry-container">
        <div class="registry-header">
          <t-button theme="primary" @click="handleAddRegistry">
            <template #icon>
              <t-icon name="add" />
            </template>
            添加仓库
          </t-button>
        </div>
        <t-table :data="registries" :columns="registryColumns" :loading="registryLoading" row-key="registry">
          <template #registry="{ row }">
            <t-tag theme="primary" variant="light">{{ row.registry }}</t-tag>
          </template>
          <template #status="{ row }">
            <t-tag :theme="row.status ? 'success' : 'warning'" variant="light">
              {{ row.status ? '已登录' : '未登录' }}
            </t-tag>
          </template>
          <template #operation="{ row }">
            <t-space>
              <t-button theme="primary" @click="handleRegistryLogin(row)">登录</t-button>
              <t-button theme="danger" @click="handleRegistryDelete(row)">删除</t-button>
            </t-space>
          </template>
        </t-table>
      </div>
    </t-dialog>

    <!-- 添加仓库对话框 -->
    <t-dialog
      v-model:visible="addRegistryDialogVisible"
      header="添加仓库"
      :on-confirm="onAddRegistryConfirm"
      :close-on-overlay-click="false"
    >
      <t-form ref="addRegistryForm" :data="addRegistryFormData" :rules="addRegistryFormRules" label-width="100px">
        <t-form-item label="仓库地址" name="registry">
          <t-input v-model="addRegistryFormData.registry" placeholder="请输入仓库地址" />
        </t-form-item>
        <t-form-item label="用户名" name="username">
          <t-input v-model="addRegistryFormData.username" placeholder="请输入用户名" />
        </t-form-item>
        <t-form-item label="密码" name="password">
          <t-input v-model="addRegistryFormData.password" type="password" placeholder="请输入密码" />
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 登录仓库对话框 -->
    <t-dialog
      v-model:visible="loginRegistryDialogVisible"
      header="登录仓库"
      :on-confirm="onLoginRegistryConfirm"
      :close-on-overlay-click="false"
    >
      <t-form ref="loginRegistryForm" :data="loginRegistryFormData" :rules="loginRegistryFormRules" label-width="100px">
        <t-form-item label="用户名" name="username">
          <t-input v-model="loginRegistryFormData.username" placeholder="请输入用户名" />
        </t-form-item>
        <t-form-item label="密码" name="password">
          <t-input v-model="loginRegistryFormData.password" type="password" placeholder="请输入密码" />
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 拉取镜像对话框 -->
    <t-dialog
      v-model:visible="pullImageDialogVisible"
      header="拉取镜像"
      :on-confirm="onPullImageConfirm"
      :close-on-overlay-click="false"
      :footer="!isPulling"
      width="800px"
    >
      <t-form
        v-if="!isPulling"
        ref="pullImageForm"
        :data="pullImageFormData"
        :rules="pullImageFormRules"
        label-width="100px"
      >
        <t-form-item label="镜像地址" name="image">
          <t-input v-model="pullImageFormData.image" placeholder="请输入镜像地址，例如：nginx" />
        </t-form-item>
        <t-form-item label="版本" name="tag">
          <t-input v-model="pullImageFormData.tag" placeholder="请输入版本，例如：latest" />
        </t-form-item>
        <t-form-item label="使用代理" name="useProxy">
          <t-switch v-model="pullImageFormData.useProxy" />
        </t-form-item>
      </t-form>
      <div v-else class="pull-progress-container">
        <div class="progress-header">
          <span class="image-title">正在拉取镜像: {{ pullImageFormData.image }}:{{ pullImageFormData.tag }}</span>
          <span class="progress-percentage">{{ pullProgress }}%</span>
        </div>
        <t-progress :percentage="pullProgress" :status="pullStatus" :stroke-width="12" />
        <div class="progress-info">
          <div v-if="pullLayers.length > 0" class="layers-info">
            <div
              v-for="(layer, index) in pullLayers"
              :key="index"
              class="layer-item"
              :class="{
                'layer-completed': isLayerCompleted(layer),
                'layer-in-progress': !isLayerCompleted(layer),
              }"
            >
              <div class="layer-header">
                <span class="layer-id">{{ layer.id?.slice(0, 12) }}</span>
                <t-progress
                  v-if="getLayerProgress(layer) > 0"
                  theme="plump"
                  :percentage="getLayerProgress(layer)"
                  :stroke-width="6"
                  :show-label="false"
                  class="layer-progress-bar"
                />
              </div>
              <div class="layer-content">
                <span class="layer-status">{{ layer.status }}</span>
                <span v-if="layer.progress" class="layer-progress">{{ formatLayerProgress(layer.progress) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="progress-message">
            {{ pullMessage || '准备开始拉取...' }}
          </div>
        </div>
        <div class="progress-actions">
          <t-button theme="danger" @click="handleCancelPull">取消拉取</t-button>
        </div>
      </div>
    </t-dialog>

    <!-- 拉取任务详情对话框 -->
    <t-dialog
      v-model:visible="pullTaskDetailsVisible"
      header="拉取任务详情"
      :close-on-overlay-click="true"
      width="800px"
    >
      <div v-if="currentTaskDetails" class="pull-progress-container">
        <div class="progress-header">
          <span class="image-title">镜像: {{ currentTaskDetails.image }}:{{ currentTaskDetails.tag }}</span>
          <span class="progress-percentage">{{ currentTaskDetails.progress }}%</span>
        </div>
        <t-progress
          :percentage="currentTaskDetails.progress"
          :status="getProgressStatus(currentTaskDetails.status)"
          :stroke-width="12"
        />
        <div class="progress-info">
          <div v-if="currentTaskDetails.layers && currentTaskDetails.layers.length > 0" class="layers-info">
            <div
              v-for="(layer, index) in currentTaskDetails.layers"
              :key="index"
              class="layer-item"
              :class="{
                'layer-completed': isLayerCompleted(layer),
                'layer-in-progress': !isLayerCompleted(layer),
              }"
            >
              <div class="layer-header">
                <span class="layer-id">{{ layer.id?.slice(0, 12) }}</span>
                <t-progress
                  v-if="getLayerProgress(layer) > 0"
                  theme="plump"
                  :percentage="getLayerProgress(layer)"
                  :stroke-width="6"
                  :show-label="false"
                  class="layer-progress-bar"
                />
              </div>
              <div class="layer-content">
                <span class="layer-status">{{ layer.status }}</span>
                <span v-if="layer.progress" class="layer-progress">{{ formatLayerProgress(layer.progress) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="progress-message">
            {{ currentTaskDetails.message || '准备开始拉取...' }}
          </div>
        </div>
      </div>
    </t-dialog>

    <!-- 删除确认对话框 -->
    <t-dialog
      v-model:visible="deleteConfirmVisible"
      header="确认删除"
      :on-confirm="confirmDelete"
      :close-on-overlay-click="false"
    >
      <div class="delete-confirm-body">
        <p>
          确定要删除镜像
          {{ currentDeleteImage?.RepoTags?.[0] || currentDeleteImage?.Id?.slice(0, 12) || '未命名镜像' }} 吗？
        </p>
      </div>
    </t-dialog>

    <!-- 创建容器对话框 -->
    <t-dialog
      v-model:visible="runContainerDialogVisible"
      header="创建容器"
      :close-on-overlay-click="false"
      width="800px"
    >
      <t-form ref="runContainerForm" :data="runContainerFormData" :rules="runContainerFormRules" label-width="100px">
        <t-form-item label="容器名称" name="name">
          <t-input v-model="runContainerFormData.name" placeholder="请输入容器名称" />
        </t-form-item>
        <t-form-item label="端口映射" name="portMappings">
          <t-input v-model="runContainerFormData.portMappings" placeholder="请输入端口映射，例如：8080:80" />
        </t-form-item>
        <t-form-item label="卷映射" name="volumeMappings">
          <t-input
            v-model="runContainerFormData.volumeMappings"
            placeholder="请输入卷映射，例如：/host/path:/container/path"
          />
        </t-form-item>
        <t-form-item label="环境变量" name="envVariables">
          <t-input v-model="runContainerFormData.envVariables" placeholder="请输入环境变量，例如：VAR=value" />
        </t-form-item>
        <t-form-item label="启动命令" name="command">
          <t-input v-model="runContainerFormData.command" placeholder="请输入启动命令" />
        </t-form-item>
        <t-form-item label="自动重启" name="autoRestart">
          <t-switch v-model="runContainerFormData.autoRestart" />
        </t-form-item>
        <t-form-item label="网络模式" name="networkMode">
          <t-select v-model="runContainerFormData.networkMode" :options="networkModeOptions" />
        </t-form-item>
        <t-form-item label="重启策略" name="restartPolicy">
          <t-select v-model="runContainerFormData.restartPolicy" :options="restartPolicyOptions" />
        </t-form-item>
        <t-form-item label="内存限制" name="memoryLimit">
          <t-input v-model="runContainerFormData.memoryLimit" placeholder="请输入内存限制，例如：512m" />
        </t-form-item>
        <t-form-item label="CPU限制" name="cpuLimit">
          <t-input v-model="runContainerFormData.cpuLimit" placeholder="请输入CPU限制，例如：1" />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { Client } from '@stomp/stompjs';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, onUnmounted, ref } from 'vue';

import {
  addRegistry,
  batchUpdateImages,
  cancelImagePull,
  checkImageUpdates,
  deleteImage,
  deleteRegistry,
  getImageList,
  getImagePullProgress,
  getLoginStatus,
  getRegistries,
  loginDockerRegistry,
  pullImage,
  testProxyLatency,
  updateImage,
} from '@/api/container';

// ==================== 1. 响应式数据定义 ====================
const images = ref([]);
const loading = ref(false);
const loginDialogVisible = ref(false);
const loginForm = ref<any>(null);
const loginFormData = ref({
  registry: '',
  username: '',
  password: '',
});

// ==================== 2. 表单验证规则 ====================
// const loginFormRules = {
//   registry: [{ required: true, message: '请输入仓库地址' }],
//   username: [{ required: true, message: '请输入用户名' }],
//   password: [{ required: true, message: '请输入密码' }],
// };

// ==================== 3. 表格列配置 ====================
const columns = [
  { colKey: 'Id', title: '镜像ID', width: 120 },
  { colKey: 'name', title: '镜像名称', width: 220 },
  { colKey: 'tag', title: '标签', width: 100 },
  { colKey: 'size', title: '大小', width: 100 },
  { colKey: 'created', title: '创建时间', width: 180 },
  { colKey: 'needUpdate', title: '更新状态', width: 100 },
  { colKey: 'lastChecked', title: '上次检查', width: 180 },
  { colKey: 'operation', title: '操作', width: 200 },
];

// ==================== 4. 工具函数 ====================
const formatSize = (size) => {
  if (!size) return '未知';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let index = 0;
  let formattedSize = size;

  while (formattedSize >= 1024 && index < units.length - 1) {
    formattedSize /= 1024;
    index++;
  }

  return `${formattedSize.toFixed(2)} ${units[index]}`;
};

const formatDate = (date) => {
  if (!date) return '未知';
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return new Date(date).toLocaleString();
};

const formatLabels = (labels: Record<string, string> | null) => {
  if (!labels) return '无';
  return Object.entries(labels)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
};

// ==================== 5. API调用函数 ====================
// 获取镜像列表
const fetchImages = async () => {
  loading.value = true;
  try {
    const response = await getImageList();
    if (response.code === 0) {
      console.log('API response:', response.data);
      images.value = response.data.map((img) => {
        const imageId = img.id || '';
        if (!imageId) {
          console.warn('镜像ID为空:', img);
        }
        return {
          ...img,
          Id: imageId,
          name: img.name || '未命名镜像',
          tag: img.tag || 'latest',
        };
      });
    } else {
      MessagePlugin.error(response.message || '获取镜像列表失败');
    }
  } catch (error) {
    console.error('获取镜像列表失败:', error);
    MessagePlugin.error('获取镜像列表失败');
  } finally {
    loading.value = false;
  }
};

// ==================== 6. 事件处理函数 ====================
const handleDelete = (row: any) => {
  if (!row.Id) {
    MessagePlugin.error('无法获取镜像ID，删除操作失败');
    return;
  }
  currentDeleteImage.value = row;
  deleteConfirmVisible.value = true;
};

const confirmDelete = async () => {
  if (!currentDeleteImage.value) {
    console.error('当前删除镜像对象为空');
    return;
  }

  try {
    const result = await deleteImage(currentDeleteImage.value.Id);
    if (result.code === 0) {
      MessagePlugin.success('镜像删除成功');
      fetchImages();
    } else {
      MessagePlugin.error(result.message || '镜像删除失败');
    }
  } catch (error) {
    console.error('删除镜像出错:', error);
    MessagePlugin.error('镜像删除失败');
  } finally {
    deleteConfirmVisible.value = false;
    currentDeleteImage.value = null;
  }
};

// ==================== 7. 生命周期钩子 ====================
onMounted(() => {
  fetchImages();
  const cleanupInterval = setInterval(cleanupOldTasks, 60 * 60 * 1000);
  onUnmounted(() => {
    clearInterval(cleanupInterval);
  });
});

// ==================== 8. 拉取镜像相关状态 ====================
const pullImageDialogVisible = ref(false);
const pullImageForm = ref<any>(null);
const pullImageFormData = ref({
  image: '',
  tag: 'latest',
  useProxy: false,
});
const isPulling = ref(false);
const pullProgress = ref(0);
const pullStatus = ref<'active' | 'success' | 'warning' | 'error'>('active');
const pullMessage = ref('');
const pullLayers = ref<any[]>([]);
const pullTaskId = ref('');
const stompClient = ref<Client | null>(null);
const socketConnected = ref(false);
const connectionAttempts = ref(0);
const maxReconnectAttempts = 5;
const reconnectInterval = ref(2000);

const pullImageFormRules = {
  image: [{ required: true, message: '请输入镜像地址' }],
  tag: [{ required: true, message: '请输入版本' }],
};

// interface ImagePullParams {
//   image: string;
//   tag: string;
//   useProxy: boolean;
// }

interface PullTask {
  taskId: string;
  image: string;
  tag: string;
  useProxy: boolean;
  progress: number;
  status: string;
  message: string;
  layers: any[];
  startTime: number;
}

const activePullTasks = ref<PullTask[]>([]);
const pullTaskDetailsVisible = ref(false);
const currentTaskDetails = ref<any>(null);

// 添加拉取任务表格列定义
const pullTaskColumns = [
  { colKey: 'image', title: '镜像名称', width: 200 },
  { colKey: 'progress', title: '进度', width: 250 },
  { colKey: 'status', title: '状态', width: 100 },
  { colKey: 'operation', title: '操作', width: 150 },
];

// 获取任务状态主题颜色
const getTaskStatusTheme = (status: string) => {
  if (!status) return 'default';
  switch (status) {
    case 'pending':
      return 'warning';
    case 'running':
      return 'primary';
    case 'success':
      return 'success';
    case 'error':
      return 'danger';
    case 'canceled':
      return 'warning';
    default:
      return 'default';
  }
};

// 获取任务状态文本
const getTaskStatusText = (status: string) => {
  if (!status) return '未知';
  switch (status) {
    case 'pending':
      return '等待中';
    case 'running':
      return '拉取中';
    case 'success':
      return '已完成';
    case 'error':
      return '失败';
    case 'canceled':
      return '已取消';
    default:
      return status;
  }
};

// 获取进度条状态
const getProgressStatus = (status: string) => {
  if (!status) return 'active';
  switch (status) {
    case 'success':
      return 'success';
    case 'error':
      return 'error';
    case 'canceled':
      return 'warning';
    default:
      return 'active';
  }
};

// 修改原有的拉取镜像确认函数，将任务添加到活动任务列表
const onPullImageConfirm = async () => {
  try {
    await pullImageForm.value?.validate();
    isPulling.value = true;
    pullProgress.value = 0;
    pullStatus.value = 'active';
    pullMessage.value = '准备拉取镜像...';

    console.log('提交拉取镜像请求:', pullImageFormData.value);
    const result = await pullImage({
      image: pullImageFormData.value.image,
      tag: pullImageFormData.value.tag,
      useProxy: pullImageFormData.value.useProxy,
    });

    if (result.code === 0) {
      console.log('拉取请求成功，获取任务ID:', result.data.taskId);

      // 获取任务ID并开始WebSocket连接
      pullTaskId.value = result.data.taskId;

      // 添加到活动任务列表
      const newTask: PullTask = {
        taskId: result.data.taskId,
        image: pullImageFormData.value.image,
        tag: pullImageFormData.value.tag,
        useProxy: pullImageFormData.value.useProxy,
        progress: 0,
        status: 'pending',
        message: '准备拉取镜像...',
        layers: [],
        startTime: Date.now(),
      };

      // 添加到活动任务列表
      activePullTasks.value = [newTask, ...activePullTasks.value];

      connectWebSocket(pullTaskId.value);
      fetchInitialProgress();
    } else {
      MessagePlugin.error(result.message || '镜像拉取失败');
      isPulling.value = false;
      pullImageDialogVisible.value = false;
    }
  } catch (error) {
    console.error('拉取镜像出错:', error);
    MessagePlugin.error('镜像拉取失败');
    isPulling.value = false;
  }
};

// 获取初始进度信息
const fetchInitialProgress = async () => {
  try {
    console.log('获取初始进度信息，任务ID:', pullTaskId.value);
    const progressResult = await getImagePullProgress(pullTaskId.value);
    if (progressResult.code === 0) {
      console.log('获取到初始进度信息:', progressResult.data);
      updatePullProgress(progressResult.data);
    } else {
      console.warn('获取初始进度失败:', progressResult.message);
    }
  } catch (error) {
    console.error('获取初始进度出错:', error);
  }

  // 设置定时获取进度 (备用方案，以防WebSocket失败)
  // startProgressPolling();
};

// 备用方案：定时轮询进度
// const progressTimer = ref<number | null>(null);
// const startProgressPolling = () => {
//   if (progressTimer.value) {
//     clearInterval(progressTimer.value);
//   }
//
//   // 每3秒轮询一次作为后备措施
//   progressTimer.value = window.setInterval(async () => {
//     if (!isPulling.value || !pullTaskId.value) {
//       clearInterval(progressTimer.value!);
//       return;
//     }
//
//     try {
//       const response = await getImagePullProgress(pullTaskId.value);
//       if (response.code === 0) {
//         console.log('轮询获取进度:', response.data.progress);
//         // 如果WebSocket没有更新进度，则使用轮询结果
//         updatePullProgress(response.data);
//       }
//     } catch (error) {
//       console.error('轮询进度失败:', error);
//     }
//   }, 3000);
// };

// 停止轮询
// const stopProgressPolling = () => {
//   if (progressTimer.value) {
//     clearInterval(progressTimer.value);
//     progressTimer.value = null;
//   }
// };

// 连接WebSocket
const connectWebSocket = (taskId: string) => {
  // 断开之前的连接
  disconnectWebSocket();

  if (connectionAttempts.value >= maxReconnectAttempts) {
    console.warn('达到最大重连次数，切换到轮询模式');
    return;
  }

  connectionAttempts.value++;
  console.log(`WebSocket连接尝试 ${connectionAttempts.value}/${maxReconnectAttempts}`);

  try {
    // 创建新的WebSocket连接
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws`;
    console.log('连接WebSocket:', wsUrl);

    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: {},
      debug(str) {
        console.log('STOMP:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // 连接成功后订阅拉取进度主题
    client.onConnect = function () {
      socketConnected.value = true;
      console.log('WebSocket连接成功，订阅进度主题');

      // 重置重连计数
      connectionAttempts.value = 0;

      // 订阅特定任务的进度主题
      client.subscribe(`/topic/image/pull/${taskId}`, (message) => {
        try {
          const progressData = JSON.parse(message.body);
          console.log('接收到WebSocket进度:', progressData.progress);
          updatePullProgress(progressData);
        } catch (e) {
          console.error('解析WebSocket消息失败:', e);
        }
      });

      console.log('WebSocket订阅已完成');
    };

    client.onStompError = function (frame) {
      console.error('STOMP错误:', frame.headers.message);
      console.error('错误详情:', frame.body);

      // 重连或切换到轮询模式
      reconnectWebSocket(taskId);
    };

    client.onWebSocketError = function (event) {
      console.error('WebSocket连接错误:', event);
      reconnectWebSocket(taskId);
    };

    client.onWebSocketClose = function (event) {
      console.warn('WebSocket连接关闭:', event);
      if (socketConnected.value) {
        socketConnected.value = false;
        reconnectWebSocket(taskId);
      }
    };

    // 启动连接
    client.activate();
    stompClient.value = client;
  } catch (error) {
    console.error('创建WebSocket连接失败:', error);
    reconnectWebSocket(taskId);
  }
};

// 重连WebSocket
const reconnectWebSocket = (taskId: string) => {
  if (!isPulling.value) return;

  if (connectionAttempts.value < maxReconnectAttempts) {
    console.log(`尝试重连 (${connectionAttempts.value}/${maxReconnectAttempts})...`);
    setTimeout(() => {
      connectWebSocket(taskId);
    }, reconnectInterval.value);

    // 增加重连延迟
    reconnectInterval.value = Math.min(reconnectInterval.value * 1.5, 10000);
  } else {
    console.warn('WebSocket连接失败，切换到轮询模式');
  }
};

// 断开WebSocket连接
const disconnectWebSocket = () => {
  if (stompClient.value) {
    try {
      if (stompClient.value.connected) {
        stompClient.value.deactivate();
        console.log('WebSocket已断开连接');
      }
    } catch (e) {
      console.error('断开WebSocket失败:', e);
    }
    stompClient.value = null;
  }
  socketConnected.value = false;
  // stopProgressPolling();
};

// 修改更新进度函数，同时更新活动任务列表中的进度
const updatePullProgress = (data: any) => {
  if (!data) return;

  pullProgress.value = data.progress || 0;
  pullMessage.value = data.message || '准备拉取镜像...';

  // 更新活动任务列表中的进度
  const taskIndex = activePullTasks.value.findIndex((task) => task.taskId === pullTaskId.value);
  if (taskIndex >= 0) {
    const updatedTask = { ...activePullTasks.value[taskIndex] };
    updatedTask.progress = data.progress || 0;
    updatedTask.status = data.status || updatedTask.status;
    updatedTask.message = data.message || updatedTask.message;

    if (data.layers && Array.isArray(data.layers)) {
      // 排序层，把未完成的放前面
      const sortedLayers = [...data.layers].sort((a, b) => {
        const aCompleted = isLayerCompleted(a);
        const bCompleted = isLayerCompleted(b);
        if (aCompleted && !bCompleted) return 1;
        if (!aCompleted && bCompleted) return -1;
        return 0;
      });
      updatedTask.layers = sortedLayers;
    }

    activePullTasks.value.splice(taskIndex, 1, updatedTask);

    // 如果当前正在查看此任务的详情，也更新详情
    if (currentTaskDetails.value && currentTaskDetails.value.taskId === pullTaskId.value) {
      currentTaskDetails.value = { ...updatedTask };
    }
  }

  // if (data.layers && Array.isArray(data.layers)) {
  //   // 排序层，把未完成的放前面
  //   const sortedLayers = [...data.layers].sort((a, b) => {
  //     const aCompleted = isLayerCompleted(a);
  //     const bCompleted = isLayerCompleted(b);
  //     if (aCompleted && !bCompleted) return 1;
  //     if (!aCompleted && bCompleted) return -1;
  //     return 0;
  //   });
  //   pullLayers.value = sortedLayers;
  // }

  // 设置状态
  if (data.status === 'error' || data.isError) {
    pullStatus.value = 'error';
    disconnectWebSocket();
    MessagePlugin.error(`拉取镜像失败: ${data.message}`);

    // 3秒后关闭对话框
    setTimeout(() => {
      isPulling.value = false;
      pullImageDialogVisible.value = false;
    }, 3000);
  } else if (data.completed) {
    pullStatus.value = 'success';
    disconnectWebSocket();
    MessagePlugin.success('镜像拉取成功');

    // 1.5秒后关闭对话框并刷新列表
    setTimeout(() => {
      isPulling.value = false;
      pullImageDialogVisible.value = false;
      fetchImages();
    }, 1500);
  } else if (data.status === 'canceled') {
    pullStatus.value = 'warning';
    disconnectWebSocket();
    MessagePlugin.warning('拉取镜像已取消');

    // 1.5秒后关闭对话框
    setTimeout(() => {
      isPulling.value = false;
      pullImageDialogVisible.value = false;
    }, 1500);
  }
};

const handleCancelPull = async () => {
  if (!pullTaskId.value) {
    isPulling.value = false;
    pullImageDialogVisible.value = false;
    return;
  }

  try {
    console.log('取消拉取任务:', pullTaskId.value);
    const result = await cancelImagePull(pullTaskId.value);

    if (result.code === 0) {
      disconnectWebSocket();
      MessagePlugin.warning('已取消拉取镜像');
    } else {
      MessagePlugin.error(result.message || '取消拉取失败');
    }
  } catch (error) {
    console.error('取消拉取失败:', error);
    MessagePlugin.error('取消拉取失败');
  } finally {
    isPulling.value = false;
    pullImageDialogVisible.value = false;
  }
};

// 组件卸载时清除连接
onUnmounted(() => {
  disconnectWebSocket();
});

const handleRun = (row: any) => {
  currentImage.value = row;
  // 重置表单数据
  runContainerFormData.value = {
    name: '',
    portMappings: [],
    volumeMappings: [],
    envVariables: [],
    command: '',
    autoRestart: false,
    networkMode: 'bridge',
    restartPolicy: 'no',
    memoryLimit: '',
    cpuLimit: '',
  };
  runContainerDialogVisible.value = true;
};

const deleteConfirmVisible = ref(false);
const currentDeleteImage = ref<any>(null);

// const handleLogin = () => {
//   loginDialogVisible.value = true;
// };

// const onLoginConfirm = async () => {
//   try {
//     if (!loginForm.value) {
//       MessagePlugin.error('表单实例不存在');
//       return;
//     }
//     await loginForm.value.validate();
//     const result = await loginDockerRegistry(loginFormData.value);
//     if (result.code === 0) {
//       MessagePlugin.success('登录成功');
//       loginDialogVisible.value = false;
//     } else {
//       MessagePlugin.error(result.message || '登录失败');
//     }
//   } catch (error) {
//     MessagePlugin.error('登录失败');
//   }
// };

// 仓库管理相关
const registryDialogVisible = ref(false);
const addRegistryDialogVisible = ref(false);
const loginRegistryDialogVisible = ref(false);
const registries = ref([]);
const registryLoading = ref(false);
const addRegistryForm = ref<any>(null);
const loginRegistryForm = ref<any>(null);
const currentRegistry = ref<any>(null);

const addRegistryFormData = ref({
  registry: '',
  username: '',
  password: '',
});

const loginRegistryFormData = ref({
  username: '',
  password: '',
});

const addRegistryFormRules = {
  registry: [{ required: true, message: '请输入仓库地址' }],
  username: [{ required: true, message: '请输入用户名' }],
  password: [{ required: true, message: '请输入密码' }],
};

const loginRegistryFormRules = {
  username: [{ required: true, message: '请输入用户名' }],
  password: [{ required: true, message: '请输入密码' }],
};

const registryColumns = [
  { colKey: 'registry', title: '仓库地址', width: 200 },
  { colKey: 'status', title: '状态', width: 100 },
  { colKey: 'operation', title: '操作', width: 200 },
];

const handleRegistry = () => {
  registryDialogVisible.value = true;
  fetchRegistries();
};

const fetchRegistries = async () => {
  registryLoading.value = true;
  try {
    const response = await getRegistries();
    if (response.code === 0) {
      registries.value = await Promise.all(
        response.data.map(async (registry: any) => {
          const statusResponse = await getLoginStatus(registry.registry);
          return {
            ...registry,
            status: statusResponse.code === 0 && statusResponse.data,
          };
        }),
      );
    } else {
      MessagePlugin.error(response.message || '获取仓库列表失败');
    }
  } catch (error) {
    console.error('获取仓库列表失败:', error);
    MessagePlugin.error('获取仓库列表失败');
  } finally {
    registryLoading.value = false;
  }
};

const handleAddRegistry = () => {
  addRegistryDialogVisible.value = true;
};

const onAddRegistryConfirm = async () => {
  try {
    if (!addRegistryForm.value) {
      MessagePlugin.error('表单实例不存在');
      return;
    }
    await addRegistryForm.value.validate();
    const result = await addRegistry(addRegistryFormData.value);
    if (result.code === 0) {
      MessagePlugin.success('添加仓库成功');
      addRegistryDialogVisible.value = false;
      fetchRegistries();
    } else {
      MessagePlugin.error(result.message || '添加仓库失败');
    }
  } catch (error) {
    MessagePlugin.error('添加仓库失败');
  }
};

const handleRegistryLogin = (row: any) => {
  currentRegistry.value = row;
  loginRegistryDialogVisible.value = true;
};

const onLoginRegistryConfirm = async () => {
  try {
    if (!loginRegistryForm.value || !currentRegistry.value) {
      MessagePlugin.error('表单实例或当前仓库信息不存在');
      return;
    }
    await loginRegistryForm.value.validate();
    const result = await loginDockerRegistry({
      registry: currentRegistry.value.registry,
      username: loginRegistryFormData.value.username,
      password: loginRegistryFormData.value.password,
    });
    if (result.code === 0) {
      MessagePlugin.success('登录成功');
      loginRegistryDialogVisible.value = false;
      fetchRegistries();
    } else {
      MessagePlugin.error(result.message || '登录失败');
    }
  } catch (error) {
    MessagePlugin.error('登录失败');
  }
};

const handleRegistryDelete = async (row: any) => {
  try {
    const result = await deleteRegistry(row.registry);
    if (result.code === 0) {
      MessagePlugin.success('删除仓库成功');
      fetchRegistries();
    } else {
      MessagePlugin.error(result.message || '删除仓库失败');
    }
  } catch (error) {
    MessagePlugin.error('删除仓库失败');
  }
};

// 计算各层的进度百分比
const getLayerProgress = (layer: any) => {
  if (!layer || !layer.progress) return 0;

  const progressText = layer.progress;
  // 从形如 "[=====>    ] 65.32MB/120.13MB" 的字符串中提取进度
  const progressMatch = progressText.match(/\[(=+>?\s*)\]\s*([\d.]+)MB\/([\d.]+)MB/);

  if (progressMatch) {
    const current = parseFloat(progressMatch[2]);
    const total = parseFloat(progressMatch[3]);
    if (!isNaN(current) && !isNaN(total) && total > 0) {
      return Math.floor((current / total) * 100);
    }
  }

  // 根据等号数量估算进度
  const barMatch = progressText.match(/\[(=+>?)\s*\]/);
  if (barMatch) {
    const bar = barMatch[1];
    const barLength = bar.length;
    const totalLength = 10; // 假设总长度为10
    return Math.floor((barLength / totalLength) * 100);
  }

  return 0;
};

// 修改格式化层级进度的函数，去掉百分比数字
const formatLayerProgress = (progressText: string) => {
  if (!progressText) return '';

  // 从形如 "[=====>    ] 65.32MB/120.13MB" 的字符串中提取数值部分
  const mbMatch = progressText.match(/([\d.]+)MB\/([\d.]+)MB/);
  if (mbMatch) {
    const current = parseFloat(mbMatch[1]);
    const total = parseFloat(mbMatch[2]);
    if (!isNaN(current) && !isNaN(total) && total > 0) {
      return `${current.toFixed(2)}MB/${total.toFixed(2)}MB`;
    }
    return `${mbMatch[0]}`;
  }

  // 如果没有MB格式，则去除进度条部分
  const cleanedText = progressText.replace(/\[=*>*\s*\]\s*/, '').trim();
  return cleanedText || progressText;
};

// 判断层是否已完成
const isLayerCompleted = (layer: any) => {
  if (!layer || !layer.status) return false;

  const status = layer.status.toLowerCase();
  return (
    status.includes('完成') ||
    status.includes('complete') ||
    status.includes('已下载') ||
    status.includes('downloaded') ||
    status.includes('已提取') ||
    status.includes('extracted')
  );
};

// 显示拉取任务详情
const showPullTaskDetails = (task: any) => {
  currentTaskDetails.value = { ...task };
  pullTaskDetailsVisible.value = true;

  // 如果任务还在进行中，连接WebSocket获取实时更新
  if (task.status === 'pending' || task.status === 'running') {
    pullTaskId.value = task.taskId;
    connectWebSocket(task.taskId);
  }
};

// 取消指定任务
const handleCancelPullTask = async (task: any) => {
  try {
    console.log('取消拉取任务:', task.taskId);
    const result = await cancelImagePull(task.taskId);

    if (result.code === 0) {
      // 更新任务状态
      const taskIndex = activePullTasks.value.findIndex((t) => t.taskId === task.taskId);
      if (taskIndex >= 0) {
        const updatedTask = { ...activePullTasks.value[taskIndex] };
        updatedTask.status = 'canceled';
        updatedTask.message = '用户取消了拉取';
        activePullTasks.value.splice(taskIndex, 1, updatedTask);
      }

      // 如果当前正在显示该任务的详情，也需要断开连接
      if (pullTaskId.value === task.taskId) {
        disconnectWebSocket();
      }

      MessagePlugin.warning('已取消拉取镜像');
    } else {
      MessagePlugin.error(result.message || '取消拉取失败');
    }
  } catch (error) {
    console.error('取消拉取失败:', error);
    MessagePlugin.error('取消拉取失败');
  }
};

// 清理过期任务（如24小时前的成功或失败任务）
const cleanupOldTasks = () => {
  const currentTime = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  activePullTasks.value = activePullTasks.value.filter((task) => {
    // 保留所有活动任务
    if (task.status === 'pending' || task.status === 'running') {
      return true;
    }

    // 保留24小时内的已完成或失败任务
    if (task.startTime && currentTime - task.startTime < oneDayMs) {
      return true;
    }

    return false;
  });
};

// 添加代理测试相关状态
const proxyTestDialogVisible = ref(false);
const proxyTestResult = ref<any>(null);
const proxyTestLoading = ref(false);

// 添加代理测试方法
const handleTestProxy = async () => {
  proxyTestDialogVisible.value = true;
  proxyTestLoading.value = true;
  proxyTestResult.value = null;

  try {
    const result = await testProxyLatency();
    if (result.code === 0) {
      proxyTestResult.value = result.data;
    } else {
      MessagePlugin.error(result.message || '测试代理延迟失败');
    }
  } catch (error) {
    console.error('测试代理延迟失败:', error);
    MessagePlugin.error('测试代理延迟失败');
  } finally {
    proxyTestLoading.value = false;
  }
};

// 获取代理测试建议的Alert主题
const getProxyTestAlertTheme = () => {
  if (!proxyTestResult.value) return 'info';

  const { totalTime } = proxyTestResult.value;
  if (totalTime < 500) return 'success';
  if (totalTime < 1000) return 'info';
  if (totalTime < 2000) return 'warning';
  return 'error';
};

// 获取代理测试建议文本
const getProxyTestSuggestion = () => {
  if (!proxyTestResult.value) return '正在测试...';

  const { totalTime } = proxyTestResult.value;
  if (totalTime < 500) return '代理速度良好，建议使用代理';
  if (totalTime < 1000) return '代理速度一般，可以使用代理';
  if (totalTime < 2000) return '代理速度较慢，建议检查代理配置';
  return '代理速度很慢，建议不使用代理';
};

// 添加 handlePull 方法
const handlePull = () => {
  pullImageDialogVisible.value = true;
  isPulling.value = false;
  pullProgress.value = 0;
  pullStatus.value = 'active';
  pullMessage.value = '';
  pullLayers.value = [];
  pullTaskId.value = '';
  socketConnected.value = false;
  connectionAttempts.value = 0;
};

// 处理单个镜像更新
const handleUpdate = async (row) => {
  try {
    const result = await updateImage({
      image: row.name,
      tag: row.tag,
      useProxy: true, // 默认使用代理
    });

    if (result.code === 0) {
      MessagePlugin.success('镜像更新请求已提交');
      // 添加到拉取任务列表中
      if (result.data && result.data.taskId) {
        const newTask = {
          taskId: result.data.taskId,
          image: row.name,
          tag: row.tag,
          useProxy: true,
          progress: 0,
          status: 'pending',
          message: '准备更新镜像...',
          layers: [],
          startTime: Date.now(),
        };
        activePullTasks.value = [newTask, ...activePullTasks.value];
        connectWebSocket(result.data.taskId);
      }
    } else {
      MessagePlugin.error(result.message || '更新镜像失败');
    }
  } catch (error) {
    console.error('更新镜像失败:', error);
    MessagePlugin.error('更新镜像失败');
  }
};

// 检查镜像更新
const handleCheckUpdates = async () => {
  try {
    loading.value = true;
    const result = await checkImageUpdates();
    if (result.code === 0) {
      MessagePlugin.success('镜像更新检查已完成');
      fetchImages();
    } else {
      MessagePlugin.error(result.message || '检查镜像更新失败');
    }
  } catch (error) {
    console.error('检查镜像更新失败:', error);
    MessagePlugin.error('检查镜像更新失败');
  } finally {
    loading.value = false;
  }
};

// 批量更新镜像
const handleBatchUpdate = async () => {
  try {
    const result = await batchUpdateImages({
      useProxy: true,
    });

    if (result.code === 0) {
      if (result.data.totalCount === 0) {
        MessagePlugin.info('没有需要更新的镜像');
        return;
      }

      MessagePlugin.success(`批量更新已提交，共 ${result.data.totalCount} 个镜像`);
      // 显示详细结果
      // TODO: 显示批量更新结果详情

      // 刷新镜像列表
      setTimeout(() => {
        fetchImages();
      }, 2000);
    } else {
      MessagePlugin.error(result.message || '批量更新镜像失败');
    }
  } catch (error) {
    console.error('批量更新镜像失败:', error);
    MessagePlugin.error('批量更新镜像失败');
  }
};

// ==================== 9. 创建容器处理函数 ====================
const runContainerDialogVisible = ref(false);
const runContainerForm = ref<any>(null);
const currentImage = ref<any>(null);
const runContainerFormData = ref({
  name: '', // 容器名称
  portMappings: [], // 端口映射
  volumeMappings: [], // 卷映射
  envVariables: [], // 环境变量
  command: '', // 启动命令
  autoRestart: false, // 自动重启
  networkMode: 'bridge', // 网络模式
  restartPolicy: 'no', // 重启策略
  memoryLimit: '', // 内存限制
  cpuLimit: '', // CPU限制
});

const runContainerFormRules = {
  name: [{ required: true, message: '请输入容器名称' }],
  networkMode: [{ required: true, message: '请选择网络模式' }],
  restartPolicy: [{ required: true, message: '请选择重启策略' }],
};

const networkModeOptions = [
  { label: '桥接模式', value: 'bridge' },
  { label: '主机模式', value: 'host' },
  { label: '无网络', value: 'none' },
];

const restartPolicyOptions = [
  { label: '不重启', value: 'no' },
  { label: '总是重启', value: 'always' },
  { label: '失败时重启', value: 'on-failure' },
  { label: '除非停止', value: 'unless-stopped' },
];

const onRunContainerConfirm = async () => {
  try {
    await runContainerForm.value?.validate();

    // 构建创建容器的参数
    const params = {
      image: currentImage.value.name,
      tag: currentImage.value.tag,
      name: runContainerFormData.value.name,
      portMappings: runContainerFormData.value.portMappings,
      volumeMappings: runContainerFormData.value.volumeMappings,
      envVariables: runContainerFormData.value.envVariables,
      command: runContainerFormData.value.command,
      autoRestart: runContainerFormData.value.autoRestart,
      networkMode: runContainerFormData.value.networkMode,
      restartPolicy: runContainerFormData.value.restartPolicy,
      memoryLimit: runContainerFormData.value.memoryLimit,
      cpuLimit: runContainerFormData.value.cpuLimit,
    };

    const result = await createContainer(params);

    if (result.code === 0) {
      MessagePlugin.success('容器创建成功');
      runContainerDialogVisible.value = false;
      // 刷新容器列表
      // TODO: 实现容器列表刷新
    } else {
      MessagePlugin.error(result.message || '容器创建失败');
    }
  } catch (error) {
    console.error('创建容器失败:', error);
    MessagePlugin.error('创建容器失败');
  }
};
</script>

<style scoped>
.container {
  padding: 16px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.title {
  font-size: 16px;
  font-weight: 500;
}

.actions {
  display: flex;
  gap: 8px;
}

.registry-container {
  padding: 16px;
}

.registry-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.pull-progress-container {
  padding: 16px;
  min-height: 350px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.image-title {
  font-size: 16px;
  font-weight: 500;
}

.progress-percentage {
  font-size: 18px;
  font-weight: bold;
  color: #0052d9;
}

.progress-info {
  flex: 1;
  overflow-y: auto;
  max-height: 300px;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 12px;
  background-color: #f9f9f9;
}

.layers-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.layer-item {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  padding: 8px 10px;
  border-radius: 4px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border-left: 3px solid #ccc;
  transition: all 0.3s ease;
}

.layer-header {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  justify-content: space-between;
}

.layer-id {
  width: 120px;
  color: #0052d9;
  font-family: monospace;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.layer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.layer-status {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #333;
}

.layer-progress {
  width: 200px;
  text-align: right;
  color: #0052d9;
  font-family: monospace;
}

.layer-progress-bar {
  flex: 1;
  margin-left: 12px;
  max-width: 150px;
}

.progress-message {
  padding: 16px;
  color: #666;
  font-size: 14px;
  text-align: center;
}

.progress-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.layer-completed {
  border-left: 3px solid #00a870; /* 绿色，表示已完成 */
  background-color: #f0faf5; /* 浅绿背景 */
}

.layer-in-progress {
  border-left: 3px solid #0052d9; /* 蓝色，表示进行中 */
  background-color: #f0f5ff; /* 浅蓝背景 */
}

.layer-completed .layer-status {
  color: #00a870; /* 绿色文字 */
}

.layer-in-progress .layer-status {
  color: #0052d9; /* 蓝色文字 */
}

.pulling-images-section {
  margin-bottom: 16px;
  background-color: #f8f8f8;
  border-radius: 4px;
  padding: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #333;
}

.inline-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.progress-text {
  min-width: 40px;
  text-align: right;
  color: #0052d9;
  font-size: 14px;
  font-weight: 500;
}

/* 添加代理测试结果样式 */
.proxy-test-result {
  padding: 16px;
}

.test-metrics {
  margin: 16px 0;
  padding: 16px;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.metric-label {
  color: #666;
}

.metric-value {
  font-weight: 500;
  color: #0052d9;
  font-size: 18px;
}

.proxy-test-loading {
  padding: 32px;
  text-align: center;
}
</style>
