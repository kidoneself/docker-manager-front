<template>
  <div class="install-container">
    <t-card class="install-card">
      <template #title>
        <t-space align="center">
          <img :src="appDetail.icon" class="install-icon" :alt="appDetail.name" />
          <div>
            <h2 class="install-title">安装 {{ appDetail.name }}</h2>
            <t-tag theme="primary" variant="light">{{ appDetail.version }}</t-tag>
          </div>
        </t-space>
      </template>

      <t-form ref="form" :data="formData" :rules="rules" @submit="handleSubmit">
        <t-tabs v-model="activeTab">
          <t-tab-panel value="basic" label="基础配置">
            <div class="tab-content">
              <h3>容器配置</h3>
              <t-form-item label="容器名称" name="containerName">
                <t-input v-model="formData.containerName" placeholder="请输入容器名称" />
              </t-form-item>
              <t-form-item label="重启策略" name="restartPolicy">
                <t-select v-model="formData.restartPolicy" :options="restartPolicyOptions" />
              </t-form-item>
              <t-form-item label="网络模式" name="networkMode">
                <t-select v-model="formData.networkMode" :options="networkModeOptions" />
              </t-form-item>

              <h3>存储配置</h3>
              <t-form-item label="数据卷挂载" name="volumes">
                <t-space direction="vertical" style="width: 100%">
                  <div v-for="(volume, index) in formData.volumes" :key="index" class="volume-item">
                    <t-space>
                      <t-input v-model="volume.hostPath" placeholder="主机路径" style="width: 200px" />
                      <t-input v-model="volume.containerPath" placeholder="容器路径" style="width: 200px" />
                      <t-button theme="danger" variant="text" @click="removeVolume(index)">删除</t-button>
                    </t-space>
                  </div>
                  <t-button theme="default" variant="text" @click="addVolume">添加挂载</t-button>
                </t-space>
              </t-form-item>

              <h3>环境变量</h3>
              <t-form-item label="环境变量" name="environment">
                <t-space direction="vertical" style="width: 100%">
                  <div v-for="(env, index) in formData.environment" :key="index" class="env-item">
                    <t-space>
                      <t-input v-model="env.key" placeholder="变量名" style="width: 200px" />
                      <t-input v-model="env.value" placeholder="变量值" style="width: 200px" />
                      <t-button theme="danger" variant="text" @click="removeEnv(index)">删除</t-button>
                    </t-space>
                  </div>
                  <t-button theme="default" variant="text" @click="addEnv">添加环境变量</t-button>
                </t-space>
              </t-form-item>
            </div>
          </t-tab-panel>

          <t-tab-panel value="network" label="网络配置">
            <div class="tab-content">
              <h3>端口映射</h3>
              <t-form-item label="端口映射" name="ports">
                <t-space direction="vertical" style="width: 100%">
                  <div v-for="(port, index) in formData.ports" :key="index" class="port-item">
                    <t-space>
                      <t-input v-model="port.hostPort" placeholder="主机端口" style="width: 150px" />
                      <t-input v-model="port.containerPort" placeholder="容器端口" style="width: 150px" />
                      <t-select v-model="port.protocol" :options="protocolOptions" style="width: 100px" />
                      <t-button theme="danger" variant="text" @click="removePort(index)">删除</t-button>
                    </t-space>
                  </div>
                  <t-button theme="default" variant="text" @click="addPort">添加端口映射</t-button>
                </t-space>
              </t-form-item>
            </div>
          </t-tab-panel>

          <t-tab-panel value="advanced" label="高级配置">
            <div class="tab-content">
              <h3>资源限制</h3>
              <t-form-item label="CPU限制" name="cpuLimit">
                <t-input-number v-model="formData.cpuLimit" :min="0.1" :max="32" :step="0.1" />
                <span class="unit">核</span>
              </t-form-item>
              <t-form-item label="内存限制" name="memoryLimit">
                <t-input-number v-model="formData.memoryLimit" :min="128" :max="32768" :step="128" />
                <span class="unit">MB</span>
              </t-form-item>

              <h3>其他配置</h3>
              <t-form-item label="容器标签" name="labels">
                <t-space direction="vertical" style="width: 100%">
                  <div v-for="(label, index) in formData.labels" :key="index" class="label-item">
                    <t-space>
                      <t-input v-model="label.key" placeholder="标签名" style="width: 200px" />
                      <t-input v-model="label.value" placeholder="标签值" style="width: 200px" />
                      <t-button theme="danger" variant="text" @click="removeLabel(index)">删除</t-button>
                    </t-space>
                  </div>
                  <t-button theme="default" variant="text" @click="addLabel">添加标签</t-button>
                </t-space>
              </t-form-item>
            </div>
          </t-tab-panel>
        </t-tabs>

        <template #footer>
          <t-space>
            <t-button theme="primary" type="submit">开始安装</t-button>
            <t-button variant="text" @click="handleBack">返回</t-button>
          </t-space>
        </template>
      </t-form>
    </t-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';

const route = useRoute();
const router = useRouter();
const form = ref(null);
const activeTab = ref('basic');

// 模拟应用详情数据
const appDetail = ref({
  id: 1,
  name: 'Nginx',
  icon: 'https://nginx.org/nginx.png',
  version: '1.25.3',
});

// 表单数据
const formData = ref({
  containerName: '',
  restartPolicy: 'unless-stopped',
  networkMode: 'bridge',
  volumes: [{ hostPath: '', containerPath: '' }],
  environment: [{ key: '', value: '' }],
  ports: [{ hostPort: '', containerPort: '80', protocol: 'tcp' }],
  cpuLimit: 1,
  memoryLimit: 1024,
  labels: [{ key: '', value: '' }],
});

// 表单校验规则
const rules = {
  containerName: [{ required: true, message: '请输入容器名称' }],
  restartPolicy: [{ required: true, message: '请选择重启策略' }],
  networkMode: [{ required: true, message: '请选择网络模式' }],
};

// 选项数据
const restartPolicyOptions = [
  { label: '不重启', value: 'no' },
  { label: '总是重启', value: 'always' },
  { label: '失败时重启', value: 'on-failure' },
  { label: '除非手动停止', value: 'unless-stopped' },
];

const networkModeOptions = [
  { label: '桥接模式', value: 'bridge' },
  { label: '主机模式', value: 'host' },
  { label: '无网络', value: 'none' },
];

const protocolOptions = [
  { label: 'TCP', value: 'tcp' },
  { label: 'UDP', value: 'udp' },
];

// 表单操作方法
const addVolume = () => {
  formData.value.volumes.push({ hostPath: '', containerPath: '' });
};

const removeVolume = (index: number) => {
  formData.value.volumes.splice(index, 1);
};

const addEnv = () => {
  formData.value.environment.push({ key: '', value: '' });
};

const removeEnv = (index: number) => {
  formData.value.environment.splice(index, 1);
};

const addPort = () => {
  formData.value.ports.push({ hostPort: '', containerPort: '', protocol: 'tcp' });
};

const removePort = (index: number) => {
  formData.value.ports.splice(index, 1);
};

const addLabel = () => {
  formData.value.labels.push({ key: '', value: '' });
};

const removeLabel = (index: number) => {
  formData.value.labels.splice(index, 1);
};

// 提交表单
const handleSubmit = ({ validateResult }: { validateResult: any }) => {
  if (validateResult === true) {
    MessagePlugin.success('开始安装...');
    // TODO: 调用安装API
    console.log('安装配置:', formData.value);
  }
};

const handleBack = () => {
  router.back();
};

onMounted(() => {
  const appId = route.params.id;
  console.log('加载应用安装配置:', appId);
});
</script>

<style scoped>
.install-container {
  padding: 16px;
}

.install-card {
  margin-bottom: 16px;
}

.install-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.install-title {
  margin: 0;
  font-size: 20px;
}

.tab-content {
  padding: 16px;
}

h3 {
  margin-top: 0;
  margin-bottom: 16px;
}

.volume-item,
.env-item,
.port-item,
.label-item {
  margin-bottom: 8px;
}

.unit {
  margin-left: 8px;
  color: var(--td-text-color-secondary);
}
</style> 