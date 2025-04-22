<template>
  <div class="detail-wrapper">
    <div class="detail-container">
      <t-card :bordered="false">
        <!-- 应用基本信息 -->
        <div class="app-info">
          <div class="app-header">
            <img :src="appInfo.icon" class="app-icon" :alt="appInfo.name" />
            <div class="app-meta">
              <h1 class="app-name">{{ appInfo.name }}</h1>
              <div class="app-tags">
                <t-tag theme="primary" variant="light">{{ appInfo.category }}</t-tag>
                <t-tag theme="success" variant="light">{{ appInfo.version }}</t-tag>
              </div>
            </div>
            <div class="app-actions">
              <t-space>
                <t-button theme="primary" @click="handleSubmit">安装</t-button>
                <t-button variant="text" @click="router.back()">取消</t-button>
              </t-space>
            </div>
          </div>
          <div class="app-description">{{ appInfo.description }}</div>
        </div>

        <!-- 服务选择和配置 -->
        <div class="config-section">
          <div class="config-header">
            <h2 class="section-title">服务配置</h2>
            <div class="service-selector">
              <t-checkbox-group v-model="selectedServices">
                <t-space>
                  <t-checkbox
                    v-for="service in appInfo.services"
                    :key="service.name"
                    :value="service.name"
                    :disabled="isServiceDisabled(service)"
                  >
                    {{ service.displayName }}
                  </t-checkbox>
                </t-space>
              </t-checkbox-group>
            </div>
          </div>

          <!-- 配置表单 -->
          <t-form
            ref="form"
            :data="formData"
            :rules="formRules"
            label-width="120px"
            class="config-form"
          >
            <t-row :gutter="[16, 16]">
              <template v-for="field in relevantEnvFields" :key="field.key">
                <t-col :span="6">
                  <t-form-item
                    :name="field.key"
                    :label="field.label"
                    :required="field.required"
                  >
                    <t-input
                      v-model="formData[field.key]"
                      :placeholder="field.default"
                    />
                    <template #help>
                      <div class="field-description">{{ field.description }}</div>
                    </template>
                  </t-form-item>
                </t-col>
              </template>
            </t-row>
          </t-form>
        </div>
      </t-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'

const route = useRoute()
const router = useRouter()

// 应用信息
const appInfo = ref({
  id: '1',
  name: 'NAS PT 套件',
  description: '包含多个媒体和下载服务的套件，提供完整的家庭媒体中心解决方案。支持视频转码、远程下载、媒体管理等功能。',
  icon: 'https://pan.naspt.vip/d/naspt/emby%E5%9B%BE/MoviePoilt.jpg',
  category: 'media',
  version: 'latest',
  services: [
    {
      name: 'tr',
      displayName: 'Transmission',
      description: '轻量级BT下载工具，支持磁力链接和种子文件，提供Web管理界面',
      dependencies: [],
    },
    {
      name: 'emby',
      displayName: 'Emby',
      description: '功能强大的媒体服务器，支持视频、音乐和照片管理，提供跨平台客户端',
      dependencies: ['tr'],
    },
    {
      name: 'plex',
      displayName: 'Plex',
      description: '流行的媒体服务器，提供丰富的客户端支持和转码功能',
      dependencies: [],
    },
    {
      name: 'sonarr',
      displayName: 'Sonarr',
      description: '自动化的TV剧集下载和管理工具',
      dependencies: ['tr'],
    }
  ],
})

// 环境变量配置
const envFields = ref([
  {
    key: 'TR_PORT',
    label: 'Transmission Web端口',
    description: 'Transmission Web界面的访问端口',
    default: '9091',
    required: true,
    serviceDependencies: ['tr'],
  },
  {
    key: 'TR_CONFIG_PATH',
    label: 'Transmission 配置路径',
    description: 'Transmission 配置文件的存储路径',
    default: '/volume1/docker/tr/config',
    required: true,
    serviceDependencies: ['tr'],
  },
  // 更多配置项...
])

// 选中的服务
const selectedServices = ref<string[]>([])

// 表单数据
const formData = ref<Record<string, string>>({})
const formRules = ref<Record<string, any>>({})

// 计算相关配置项
const relevantEnvFields = computed(() => {
  return envFields.value.filter(field =>
    field.serviceDependencies.some(service =>
      selectedServices.value.includes(service)
    )
  )
})

// 检查服务是否可选
const isServiceDisabled = (service: any) => {
  if (!service.dependencies.length) return false
  return !service.dependencies.every((dep: string) =>
    selectedServices.value.includes(dep)
  )
}

// 提交表单
const handleSubmit = async () => {
  try {
    // TODO: 调用后端API安装服务
    MessagePlugin.success('开始安装...')
  } catch (error) {
    MessagePlugin.error('安装失败')
  }
}
</script>

<style scoped>
.detail-wrapper {
  height: 100%;
  background-color: var(--td-bg-color-page);
  padding: 24px;
}

.detail-container {
  height: 100%;
  background-color: var(--td-bg-color-container);
  border-radius: 12px;
  box-shadow: var(--td-shadow-1);
  padding: 24px;
}

.app-info {
  margin-bottom: 24px;
  padding: 16px;
  background-color: var(--td-bg-color-container);
  border-radius: 8px;
  box-shadow: var(--td-shadow-1);
}

.app-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 16px;
}

.app-icon {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 8px;
  background-color: var(--td-bg-color-secondarycontainer);
  padding: 8px;
}

.app-meta {
  flex: 1;
}

.app-actions {
  margin-left: auto;
}

.app-name {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--td-text-color-primary);
}

.app-tags {
  display: flex;
  gap: 8px;
}

.app-description {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  line-height: 1.6;
}

.config-section {
  background-color: var(--td-bg-color-container);
  border-radius: 8px;
  box-shadow: var(--td-shadow-1);
  padding: 24px;
}

.config-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--td-component-stroke);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--td-text-color-primary);
}

.service-selector {
  margin-top: 16px;
}

.config-form {
  max-width: 1200px;
  margin: 0 auto;
}

.field-description {
  font-size: 12px;
  color: var(--td-text-color-secondary);
  margin-top: 4px;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 响应式调整 */
@media screen and (max-width: 1200px) {
  .config-form :deep(.t-col) {
    width: 50%;
  }
}

@media screen and (max-width: 768px) {
  .detail-wrapper {
    padding: 16px;
  }

  .detail-container {
    padding: 16px;
  }

  .config-form :deep(.t-col) {
    width: 100%;
  }
}
</style> 