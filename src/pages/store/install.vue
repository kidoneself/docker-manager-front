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
          <t-tab-panel value="services" label="服务配置">
            <div class="tab-content">
              <t-space direction="vertical" style="width: 100%">
                <div v-for="(service, index) in formData.services" :key="index" class="service-card">
                  <t-card :title="service.name" :bordered="true">
                    <template #actions>
                      <t-space>
                        <t-button theme="danger" variant="text" @click="removeService(index)">删除服务</t-button>
                      </t-space>
                    </template>

                    <t-form-item label="服务名称" :name="['services', index, 'name']">
                      <t-input v-model="service.name" placeholder="请输入服务名称" />
                    </t-form-item>

                    <t-form-item label="镜像" :name="['services', index, 'image']">
                      <t-input v-model="service.image" placeholder="请输入镜像名称" />
                    </t-form-item>

                    <t-form-item label="重启策略" :name="['services', index, 'restartPolicy']">
                      <t-select v-model="service.restartPolicy" :options="restartPolicyOptions" />
                    </t-form-item>

                    <t-collapse>
                      <t-collapse-panel header="端口映射" value="ports">
                        <t-space direction="vertical" style="width: 100%">
                          <div v-for="(port, portIndex) in service.ports" :key="portIndex" class="port-item">
                            <t-space>
                              <t-input v-model="port.hostPort" placeholder="主机端口" style="width: 150px" />
                              <t-input v-model="port.containerPort" placeholder="容器端口" style="width: 150px" />
                              <t-select v-model="port.protocol" :options="protocolOptions" style="width: 100px" />
                              <t-button theme="danger" variant="text" @click="removePort(index, portIndex)">删除</t-button>
                            </t-space>
                          </div>
                          <t-button theme="default" variant="text" @click="addPort(index)">添加端口映射</t-button>
                        </t-space>
                      </t-collapse-panel>

                      <t-collapse-panel header="数据卷挂载" value="volumes">
                        <t-space direction="vertical" style="width: 100%">
                          <div v-for="(volume, volumeIndex) in service.volumes" :key="volumeIndex" class="volume-item">
                            <t-space>
                              <t-input v-model="volume.hostPath" placeholder="主机路径" style="width: 200px" />
                              <t-input v-model="volume.containerPath" placeholder="容器路径" style="width: 200px" />
                              <t-button theme="danger" variant="text" @click="removeVolume(index, volumeIndex)">删除</t-button>
                            </t-space>
                          </div>
                          <t-button theme="default" variant="text" @click="addVolume(index)">添加挂载</t-button>
                        </t-space>
                      </t-collapse-panel>

                      <t-collapse-panel header="环境变量" value="environment">
                        <t-space direction="vertical" style="width: 100%">
                          <div v-for="(env, envIndex) in service.environment" :key="envIndex" class="env-item">
                            <t-space>
                              <t-input v-model="env.key" placeholder="变量名" style="width: 200px" />
                              <t-input v-model="env.value" placeholder="变量值" style="width: 200px" />
                              <t-button theme="danger" variant="text" @click="removeEnv(index, envIndex)">删除</t-button>
                            </t-space>
                          </div>
                          <t-button theme="default" variant="text" @click="addEnv(index)">添加环境变量</t-button>
                        </t-space>
                      </t-collapse-panel>

                      <t-collapse-panel header="资源限制" value="resources">
                        <t-form-item label="CPU限制">
                          <t-input-number v-model="service.cpuLimit" :min="0.1" :max="32" :step="0.1" />
                          <span class="unit">核</span>
                        </t-form-item>
                        <t-form-item label="内存限制">
                          <t-input-number v-model="service.memoryLimit" :min="128" :max="32768" :step="128" />
                          <span class="unit">MB</span>
                        </t-form-item>
                      </t-collapse-panel>

                      <t-collapse-panel header="依赖关系" value="depends_on">
                        <t-space direction="vertical" style="width: 100%">
                          <t-checkbox-group v-model="service.depends_on" :options="getDependOptions(index)" />
                        </t-space>
                      </t-collapse-panel>
                    </t-collapse>
                  </t-card>
                </div>
                <t-button theme="default" variant="text" @click="addService">添加服务</t-button>
              </t-space>
            </div>
          </t-tab-panel>

          <t-tab-panel value="network" label="网络配置">
            <div class="tab-content">
              <h3>网络配置</h3>
              <t-form-item label="网络名称" name="networkName">
                <t-input v-model="formData.networkName" placeholder="请输入网络名称" />
              </t-form-item>
              <t-form-item label="网络驱动" name="networkDriver">
                <t-select v-model="formData.networkDriver" :options="networkDriverOptions" />
              </t-form-item>
            </div>
          </t-tab-panel>

          <t-tab-panel value="volumes" label="存储卷">
            <div class="tab-content">
              <h3>存储卷配置</h3>
              <t-form-item label="存储卷" name="namedVolumes">
                <t-space direction="vertical" style="width: 100%">
                  <div v-for="(volume, index) in formData.namedVolumes" :key="index" class="volume-item">
                    <t-space>
                      <t-input v-model="volume.name" placeholder="卷名称" style="width: 200px" />
                      <t-input v-model="volume.driver" placeholder="驱动类型" style="width: 200px" />
                      <t-button theme="danger" variant="text" @click="removeNamedVolume(index)">删除</t-button>
                    </t-space>
                  </div>
                  <t-button theme="default" variant="text" @click="addNamedVolume">添加存储卷</t-button>
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
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';

const route = useRoute();
const router = useRouter();
const form = ref(null);
const activeTab = ref('services');

// 模拟应用详情数据
const appDetail = ref({
  id: 1,
  name: 'WordPress',
  icon: 'https://wordpress.org/favicon.ico',
  version: '6.4.3',
  services: [
    {
      name: 'wordpress',
      image: 'wordpress:latest',
      ports: [{ hostPort: '8080', containerPort: '80', protocol: 'tcp' }],
      environment: [
        { key: 'WORDPRESS_DB_HOST', value: 'db' },
        { key: 'WORDPRESS_DB_USER', value: 'wordpress' },
        { key: 'WORDPRESS_DB_PASSWORD', value: 'wordpress' },
        { key: 'WORDPRESS_DB_NAME', value: 'wordpress' },
      ],
      volumes: [{ hostPath: './wordpress', containerPath: '/var/www/html' }],
      depends_on: ['db'],
    },
    {
      name: 'db',
      image: 'mysql:5.7',
      environment: [
        { key: 'MYSQL_DATABASE', value: 'wordpress' },
        { key: 'MYSQL_USER', value: 'wordpress' },
        { key: 'MYSQL_PASSWORD', value: 'wordpress' },
        { key: 'MYSQL_ROOT_PASSWORD', value: 'somewordpress' },
      ],
      volumes: [{ hostPath: './mysql', containerPath: '/var/lib/mysql' }],
    },
  ],
});

// 表单数据
const formData = ref({
  services: [
    {
      name: '',
      image: '',
      restartPolicy: 'unless-stopped',
      ports: [{ hostPort: '', containerPort: '', protocol: 'tcp' }],
      volumes: [{ hostPath: '', containerPath: '' }],
      environment: [{ key: '', value: '' }],
      cpuLimit: 1,
      memoryLimit: 1024,
      depends_on: [],
    },
  ],
  networkName: 'app-network',
  networkDriver: 'bridge',
  namedVolumes: [{ name: '', driver: 'local' }],
});

// 表单校验规则
const rules = {
  services: [
    {
      name: [{ required: true, message: '请输入服务名称' }],
      image: [{ required: true, message: '请输入镜像名称' }],
    },
  ],
  networkName: [{ required: true, message: '请输入网络名称' }],
};

// 选项数据
const restartPolicyOptions = [
  { label: '不重启', value: 'no' },
  { label: '总是重启', value: 'always' },
  { label: '失败时重启', value: 'on-failure' },
  { label: '除非手动停止', value: 'unless-stopped' },
];

const networkDriverOptions = [
  { label: '桥接', value: 'bridge' },
  { label: '覆盖', value: 'overlay' },
  { label: '主机', value: 'host' },
  { label: '无', value: 'none' },
];

const protocolOptions = [
  { label: 'TCP', value: 'tcp' },
  { label: 'UDP', value: 'udp' },
];

// 获取依赖选项
const getDependOptions = (currentIndex: number) => {
  return formData.value.services
    .filter((_, index) => index !== currentIndex)
    .map(service => ({
      label: service.name,
      value: service.name,
    }));
};

// 服务操作方法
const addService = () => {
  formData.value.services.push({
    name: '',
    image: '',
    restartPolicy: 'unless-stopped',
    ports: [{ hostPort: '', containerPort: '', protocol: 'tcp' }],
    volumes: [{ hostPath: '', containerPath: '' }],
    environment: [{ key: '', value: '' }],
    cpuLimit: 1,
    memoryLimit: 1024,
    depends_on: [],
  });
};

const removeService = (index: number) => {
  formData.value.services.splice(index, 1);
};

// 端口操作方法
const addPort = (serviceIndex: number) => {
  formData.value.services[serviceIndex].ports.push({ hostPort: '', containerPort: '', protocol: 'tcp' });
};

const removePort = (serviceIndex: number, portIndex: number) => {
  formData.value.services[serviceIndex].ports.splice(portIndex, 1);
};

// 卷操作方法
const addVolume = (serviceIndex: number) => {
  formData.value.services[serviceIndex].volumes.push({ hostPath: '', containerPath: '' });
};

const removeVolume = (serviceIndex: number, volumeIndex: number) => {
  formData.value.services[serviceIndex].volumes.splice(volumeIndex, 1);
};

// 环境变量操作方法
const addEnv = (serviceIndex: number) => {
  formData.value.services[serviceIndex].environment.push({ key: '', value: '' });
};

const removeEnv = (serviceIndex: number, envIndex: number) => {
  formData.value.services[serviceIndex].environment.splice(envIndex, 1);
};

// 命名卷操作方法
const addNamedVolume = () => {
  formData.value.namedVolumes.push({ name: '', driver: 'local' });
};

const removeNamedVolume = (index: number) => {
  formData.value.namedVolumes.splice(index, 1);
};

// 提交表单
const handleSubmit = ({ validateResult }) => {
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
  // TODO: 根据应用ID加载默认配置
  if (appDetail.value.services) {
    formData.value.services = appDetail.value.services;
  }
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

.service-card {
  margin-bottom: 16px;
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