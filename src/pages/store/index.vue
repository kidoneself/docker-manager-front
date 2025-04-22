<template>
  <div class="store-container">
    <div class="store-wrapper">
      <!-- 搜索和筛选区域 -->
      <div class="store-header">
        <t-input
          v-model="searchText"
          placeholder="搜索应用"
          clearable
          @enter="handleSearch"
          class="search-input"
        >
          <template #prefix-icon>
            <t-icon name="search" />
          </template>
        </t-input>
        
        <!-- 分类选择暂时注释，后期添加 -->
        <!-- <t-select
          v-model="category"
          :options="categoryOptions"
          placeholder="选择分类"
          clearable
          class="category-select"
        /> -->
      </div>

      <!-- 应用列表 -->
      <div class="app-list">
        <t-row :gutter="[12, 12]">
          <t-col v-for="app in filteredApps" :key="app.id" :xs="12" :sm="8" :md="5" :lg="4" :xl="4">
            <div class="app-card" @click="handleCardClick(app)">
              <div class="app-icon-container">
                <img :src="app.icon" class="app-icon" :alt="app.name" />
              </div>
              <div class="app-content">
                <div class="app-header">
                  <h3 class="app-title">{{ app.name }}</h3>
                  <span class="app-category">{{ getCategoryName(app.category) }}</span>
                </div>
                <p class="app-description">{{ app.description }}</p>
                <div class="app-footer">
                  <t-button theme="primary" size="small" @click.stop="handleInstall(app)">
                    安装
                  </t-button>
                </div>
              </div>
            </div>
          </t-col>
        </t-row>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <t-pagination
          v-model="current"
          :total="total"
          :page-size="pageSize"
          @change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'

const router = useRouter()

// 搜索和筛选
const searchText = ref('')
// const category = ref('')
// const categoryOptions = [
//   { label: '媒体服务', value: 'media' },
//   { label: '下载工具', value: 'download' },
//   { label: '开发工具', value: 'dev' },
//   { label: '数据库', value: 'database' },
// ]

// 分页
const current = ref(1)
const pageSize = ref(12)
const total = ref(100)

// 模拟数据
const apps = ref([
  {
    id: '1',
    name: 'Transmission',
    description: '轻量级BT下载工具，支持磁力链接和种子文件',
    icon: 'https://pan.naspt.vip/d/naspt/emby%E5%9B%BE/MoviePoilt.jpg',
    category: 'download',
    version: 'latest',
  },
  {
    id: '2',
    name: 'Emby',
    description: '功能强大的媒体服务器，支持视频、音乐和照片管理',
    icon: 'https://pan.naspt.vip/d/naspt/emby%E5%9B%BE/MoviePoilt.jpg',
    category: 'media',
    version: 'latest',
  },
  {
    id: '3',
    name: 'Portainer',
    description: 'Docker容器管理工具，提供直观的Web界面',
    icon: 'https://pan.naspt.vip/d/naspt/emby%E5%9B%BE/MoviePoilt.jpg',
    category: 'dev',
    version: 'latest',
  },
  {
    id: '4',
    name: 'MySQL',
    description: '流行的开源关系型数据库管理系统',
    icon: 'https://pan.naspt.vip/d/naspt/emby%E5%9B%BE/MoviePoilt.jpg',
    category: 'database',
    version: 'latest',
  },
  {
    id: '5',
    name: 'Redis',
    description: '高性能的键值对存储数据库',
    icon: 'https://pan.naspt.vip/d/naspt/emby%E5%9B%BE/MoviePoilt.jpg',
    category: 'database',
    version: 'latest',
  },
  {
    id: '6',
    name: 'Nginx',
    description: '高性能的Web服务器和反向代理服务器',
    icon: 'https://pan.naspt.vip/d/naspt/emby%E5%9B%BE/MoviePoilt.jpg',
    category: 'dev',
    version: 'latest',
  },
  {
    id: '7',
    name: 'Jellyfin',
    description: '开源的媒体服务器，支持视频、音乐和照片管理',
    icon: 'https://pan.naspt.vip/d/naspt/emby%E5%9B%BE/MoviePoilt.jpg',
    category: 'media',
    version: 'latest',
  },
  {
    id: '8',
    name: 'qBittorrent',
    description: '功能强大的BT下载工具，支持Web管理界面',
    icon: 'https://pan.naspt.vip/d/naspt/emby%E5%9B%BE/MoviePoilt.jpg',
    category: 'download',
    version: 'latest',
  },
  {
    id: '9',
    name: 'PostgreSQL',
    description: '功能强大的开源关系型数据库',
    icon: 'https://pan.naspt.vip/d/naspt/emby%E5%9B%BE/MoviePoilt.jpg',
    category: 'database',
    version: 'latest',
  },
  {
    id: '10',
    name: 'MongoDB',
    description: '流行的NoSQL数据库，支持文档存储',
    icon: 'https://pan.naspt.vip/d/naspt/emby%E5%9B%BE/MoviePoilt.jpg',
    category: 'database',
    version: 'latest',
  },
  {
    id: '11',
    name: 'Radarr',
    description: '自动化的电影下载和管理工具',
    icon: 'https://pan.naspt.vip/d/naspt/emby%E5%9B%BE/MoviePoilt.jpg',
    category: 'media',
    version: 'latest',
  },
  {
    id: '12',
    name: 'Sonarr',
    description: '自动化的TV剧集下载和管理工具',
    icon: 'https://pan.naspt.vip/d/naspt/emby%E5%9B%BE/MoviePoilt.jpg',
    category: 'media',
    version: 'latest',
  },
  {
    id: '13',
    name: 'Lidarr',
    description: '自动化的音乐下载和管理工具',
    icon: 'https://pan.naspt.vip/d/naspt/emby%E5%9B%BE/MoviePoilt.jpg',
    category: 'media',
    version: 'latest',
  },
  {
    id: '14',
    name: 'Prowlarr',
    description: '索引器管理工具，支持多种索引器',
    icon: 'https://pan.naspt.vip/d/naspt/emby%E5%9B%BE/MoviePoilt.jpg',
    category: 'media',
    version: 'latest',
  },
  {
    id: '15',
    name: 'Bazarr',
    description: '自动化的字幕下载和管理工具',
    icon: 'https://pan.naspt.vip/d/naspt/emby%E5%9B%BE/MoviePoilt.jpg',
    category: 'media',
    version: 'latest',
  }
])

// 过滤应用列表
const filteredApps = computed(() => {
  return apps.value.filter(app => {
    const matchSearch = app.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
                       app.description.toLowerCase().includes(searchText.value.toLowerCase())
    // const matchCategory = !category.value || app.category === category.value
    // return matchSearch && matchCategory
    return matchSearch
  })
})

// 事件处理
const handleSearch = () => {
  // 实现搜索逻辑
  console.log('Search:', searchText.value)
}

const handlePageChange = (page: number) => {
  current.value = page
  // 实现分页逻辑
}

const handleCardClick = (app: any) => {
  router.push(`/store/detail/${app.id}`)
}

// 获取分类名称
const getCategoryName = (category: string) => {
  const categoryMap: Record<string, string> = {
    media: '媒体服务',
    download: '下载工具',
    dev: '开发工具',
    database: '数据库',
  }
  return categoryMap[category] || category
}

// 安装应用
const handleInstall = (app: any) => {
  router.push(`/store/detail/${app.id}`)
}
</script>

<style scoped>
.store-container {
  padding: 24px;
  height: 100%;
  background-color: var(--td-bg-color-page);
}

.store-wrapper {
  height: 100%;
  background-color: var(--td-bg-color-container);
  border-radius: 12px;
  box-shadow: var(--td-shadow-1);
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.store-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
  position: relative;
}

.search-input {
  width: 240px;
  position: relative;
}

.search-input :deep(.t-input) {
  border-radius: 20px;
  padding-right: 40px;
}

.search-input :deep(.t-input__prefix) {
  left: 12px;
}

.search-input :deep(.t-input__suffix) {
  right: 12px;
}

/* 分类选择暂时注释，后期添加 */
/* .category-select {
  width: 180px;
} */

.app-list {
  flex: 1;
  margin-bottom: 24px;
  min-height: 0;
  overflow-y: auto;
}

.app-card {
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
  background: var(--td-bg-color-container);
  border: 1px solid var(--td-component-stroke);
  display: flex;
  flex-direction: row;
}

.app-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--td-shadow-3);
  border-color: var(--td-brand-color);
}

.app-icon-container {
  position: relative;
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  overflow: hidden;
}

.app-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.app-card:hover .app-icon {
  transform: scale(1.05);
}

.app-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 8px;
  min-width: 0;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.app-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-category {
  font-size: 11px;
  color: var(--td-text-color-secondary);
  background: var(--td-bg-color-secondarycontainer);
  padding: 1px 4px;
  border-radius: 3px;
  flex-shrink: 0;
  margin-left: 8px;
}

.app-description {
  flex: 1;
  font-size: 12px;
  color: var(--td-text-color-secondary);
  margin: 4px 0 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.app-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
}

.app-footer :deep(.t-button) {
  width: 60px;
  height: 24px;
  font-size: 12px;
}

.pagination {
  display: flex;
  justify-content: center;
  padding-top: 24px;
  border-top: 1px solid var(--td-component-stroke);
  margin-top: auto;
  flex-shrink: 0;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .store-container {
    padding: 16px;
  }

  .store-wrapper {
    padding: 16px;
  }

  .store-header {
    margin-bottom: 16px;
  }

  .search-input {
    width: 100%;
  }

  .app-icon-container {
    width: 80px;
    height: 80px;
  }

  .app-content {
    padding: 6px;
  }

  .app-title {
    font-size: 13px;
  }

  .app-description {
    font-size: 11px;
    margin: 3px 0 6px;
  }

  .app-footer :deep(.t-button) {
    width: 50px;
    height: 22px;
    font-size: 11px;
  }
}
</style> 