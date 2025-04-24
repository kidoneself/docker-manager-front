<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { registerHandlers, removeHandlers, pullImage, progress, status, error } from '@/api/websocket';

const imageName = ref('');

// 组件挂载时注册消息处理器
onMounted(() => {
    registerHandlers();
});

// 组件卸载时移除消息处理器
onUnmounted(() => {
    removeHandlers();
});

// 拉取镜像
const handlePullImage = () => {
    if (imageName.value) {
        pullImage(imageName.value);
    }
};
</script>

<template>
    <div class="docker-image">
        <div class="operation-panel">
            <input v-model="imageName" placeholder="输入镜像名称" />
            <button @click="handlePullImage">拉取镜像</button>
        </div>
        
        <div class="status-panel">
            <div class="status">状态: {{ status }}</div>
            <div class="progress">
                <div class="progress-bar" :style="{ width: progress + '%' }"></div>
                <span>{{ progress }}%</span>
            </div>
            <div v-if="error" class="error">{{ error }}</div>
        </div>
    </div>
</template>

<style scoped>
.docker-image {
    padding: 20px;
}

.operation-panel {
    margin-bottom: 20px;
}

.status-panel {
    border: 1px solid #eee;
    padding: 15px;
    border-radius: 4px;
}

.progress {
    margin: 10px 0;
    background: #f5f5f5;
    height: 20px;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
}

.progress-bar {
    background: #1890ff;
    height: 100%;
    transition: width 0.3s;
}

.error {
    color: #ff4d4f;
    margin-top: 10px;
}
</style> 