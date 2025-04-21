<template>
  <div>
    <div class="form-step-container">
      <!-- 简单步骤条 -->
      <t-card :bordered="false">
        <t-steps :current="activeForm" class="step-container" status="process">
          <t-step-item content="基础配置" title="基础配置" />
          <t-step-item content="网络设置" title="网络配置" />
          <t-step-item content="存储设置" title="存储配置" />
          <t-step-item content="高级设置" title="高级配置" />
        </t-steps>
      </t-card>

      <!-- 分步表单1：基础配置 -->
      <div v-show="activeForm === 0" class="rule-tips">
        <t-alert :close="true" theme="info" title="配置说明">
          <template #message>
            <p>1. 选择要使用的容器镜像，注意版本的选择，镜像来自镜像列表，如果镜像列表中没有，请先添加镜像！</p>
            <p>2. 容器名和重启策略都为默认，如果有需要请自行设置容器名称和重启策略！</p>
            <!-- <p>3. 配置工作目录和启动命令</p> -->
          </template>
        </t-alert>
      </div>
      <t-form
        v-show="activeForm === 0"
        :data="formData1"
        :rules="FORM_RULES"
        class="step-form"
        label-align="right"
        @submit="(result: SubmitContext) => onSubmit(result, 1)"
      >
        <t-form-item label="容器镜像" name="imageName">
          <t-select
            v-model="formData1.imageName"
            :loading="loading"
            :options="imageOptions"
            :style="{ width: '480px' }"
            class="demo-select-base"
            clearable
            @change="handleImageChange"
          />
        </t-form-item>
        <t-form-item label="容器名称" name="containerName">
          <t-input v-model="formData1.containerName" :style="{ width: '480px' }" />
        </t-form-item>
        <t-form-item label="重启策略" name="restartPolicy">
          <t-select v-model="formData1.restartPolicy" :style="{ width: '480px' }" class="demo-select-base" clearable>
            <t-option
              v-for="(item, index) in RESTART_POLICY_OPTIONS"
              :key="index"
              :label="item.label"
              :value="item.value"
            >
              {{ item.label }}
            </t-option>
          </t-select>
        </t-form-item>
        <!-- <t-form-item label="工作目录" name="workingDir">
          <t-input v-model="formData1.workingDir" :style="{ width: '480px' }"/>
        </t-form-item> -->
        <!-- <t-form-item label="运行用户" name="user">
          <t-input v-model="formData1.user" :style="{ width: '480px' }"/>
        </t-form-item> -->
        <!-- <t-form-item label="启动命令" name="command">
          <t-input
              v-model="formData1.command"
              :style="{ width: '480px' }"
              placeholder="可选，不填写则使用镜像默认命令"
          />
        </t-form-item> -->
        <t-form-item>
          <t-button theme="primary" type="submit">下一步</t-button>
        </t-form-item>
      </t-form>

      <!-- 分步表单2：网络配置 -->
      <div v-show="activeForm === 1" class="rule-tips">
        <t-alert :close="true" theme="info" title="配置说明">
          <template #message>
            <p>1. 选择网络模式，默认是桥接模式，如果需要其他模式请自行选择！</p>
            <p>2. 配置网络参数，如果需要其他参数请自行设置！</p>
            <p>3. 设置端口映射，如果需要其他端口映射请自行设置！</p>
          </template>
        </t-alert>
      </div>
      <t-form
        v-show="activeForm === 1"
        :data="formData2"
        :rules="FORM_RULES"
        class="step-form"
        label-align="left"
        @reset="onReset(0)"
        @submit="(result: SubmitContext) => onSubmit(result, 2)"
      >
        <t-form-item label="网络模式" name="networkMode">
          <t-select
            v-model="formData2.networkMode"
            :style="{ width: '480px' }"
            class="demo-select-base"
            clearable
            @change="handleNetworkModeChange"
          >
            <t-option v-for="(item, index) in networkOptions" :key="index" :label="item.label" :value="item.value">
              {{ item.label }}
            </t-option>
          </t-select>
        </t-form-item>
        <t-form-item v-if="showNetworkConfig" label="容器内IP" name="ipAddress">
          <t-input
            v-model="formData2.ipAddress"
            :style="{ width: '480px' }"
            :disabled="formData2.networkMode === 'bridge'"
            placeholder="可选，仅在自定义网络模式下需要"
          />
        </t-form-item>
        <t-form-item v-if="showNetworkConfig" label="网关" name="gateway">
          <t-input
            v-model="formData2.gateway"
            :style="{ width: '480px' }"
            :disabled="formData2.networkMode === 'bridge'"
            placeholder="可选，仅在自定义网络模式下需要"
          />
        </t-form-item>
        <!-- <t-form-item label="MAC地址" name="macAddress">
          <t-input
              v-model="formData2.macAddress"
              :style="{ width: '480px' }"
              placeholder="可选，仅在自定义网络模式下需要"
          /> -->
        <!-- </t-form-item> -->
        <t-form-item label="端口映射">
          <t-space direction="vertical" style="width: 100%">
            <div v-for="(port, index) in formData2.portMappings" :key="index" class="port-mapping">
              <t-space>
                <t-input-number
                  v-model="port.hostPort"
                  theme="normal"
                  align="right"
                  :disabled="disablePortMappings"
                  label="主机端口："
                ></t-input-number>
                <t-input-number
                  v-model="port.containerPort"
                  theme="normal"
                  align="right"
                  :disabled="disablePortMappings"
                  label="容器端口："
                ></t-input-number>
                <t-select v-model="port.protocol" style="width: 100px" :disabled="disablePortMappings">
                  <t-option value="tcp">TCP</t-option>
                  <t-option value="udp">UDP</t-option>
                </t-select>
                <t-button theme="danger" variant="text" :disabled="disablePortMappings" @click="removePort(index)">
                  <template #icon>
                    <t-icon name="delete" />
                  </template>
                </t-button>
              </t-space>
            </div>
            <t-button theme="default" variant="dashed" :disabled="disablePortMappings" @click="addPort">
              <template #icon>
                <t-icon name="add" />
              </template>
              添加端口映射
            </t-button>
          </t-space>
        </t-form-item>
        <t-form-item>
          <t-button theme="default" type="reset" variant="base">上一步</t-button>
          <t-button theme="primary" type="submit">下一步</t-button>
        </t-form-item>
      </t-form>

      <!-- 分步表单3：存储配置 -->
      <div v-show="activeForm === 2" class="rule-tips">
        <t-alert :close="true" theme="info" title="配置说明">
          <template #message>
            <p>1. 配置数据卷映射</p>
            <p>2. 设置挂载权限</p>
          </template>
        </t-alert>
      </div>
      <t-form
        v-show="activeForm === 2"
        :data="formData3"
        :rules="FORM_RULES"
        class="step-form"
        label-align="left"
        @reset="onReset(1)"
        @submit="(result: SubmitContext) => onSubmit(result, 3)"
      >
        <t-form-item label="数据卷映射">
          <t-space direction="vertical" style="width: 100%">
            <div v-for="(volume, index) in formData3.volumeMappings" :key="index" class="volume-mapping">
              <t-space>
                <t-input v-model="volume.hostPath" placeholder="主机路径" style="width: 200px" />
                <t-input v-model="volume.containerPath" placeholder="容器路径" style="width: 200px" />
                <t-select v-model="volume.mode" style="width: 100px">
                  <t-option value="ro">只读</t-option>
                  <t-option value="rw">读写</t-option>
                </t-select>
                <t-button theme="danger" variant="text" @click="removeVolume(index)">
                  <template #icon>
                    <t-icon name="delete" />
                  </template>
                </t-button>
              </t-space>
            </div>
            <t-button theme="default" variant="dashed" @click="addVolume">
              <template #icon>
                <t-icon name="add" />
              </template>
              添加路径映射
            </t-button>
          </t-space>
        </t-form-item>
        <t-form-item>
          <t-button theme="default" type="reset" variant="base">上一步</t-button>
          <t-button theme="primary" type="submit">下一步</t-button>
        </t-form-item>
      </t-form>

      <!-- 分步表单4：高级配置 -->
      <div v-show="activeForm === 3" class="rule-tips">
        <t-alert :close="true" theme="info" title="配置说明">
          <template #message>
            <p>1. 配置环境变量</p>
            <p>2. 设置资源限制</p>
            <p>3. 配置特权模式</p>
          </template>
        </t-alert>
      </div>
      <t-form
        v-show="activeForm === 3"
        :data="formData4"
        :rules="FORM_RULES"
        class="step-form"
        label-align="left"
        @reset="onReset(2)"
        @submit="(result: SubmitContext) => onSubmit(result, 6)"
      >
        <t-form-item label="环境变量">
          <t-space direction="vertical" style="width: 100%">
            <div v-for="(env, index) in formData4.environmentVariables" :key="index" class="env-variable">
              <t-space>
                <t-input v-model="env.key" placeholder="变量名" style="width: 200px" />
                <t-input v-model="env.value" placeholder="变量值" style="width: 200px" />
                <t-button theme="danger" variant="text" @click="removeEnv(index)">
                  <template #icon>
                    <t-icon name="delete" />
                  </template>
                </t-button>
              </t-space>
            </div>
            <t-button theme="default" variant="dashed" @click="addEnv">
              <template #icon>
                <t-icon name="add" />
              </template>
              添加环境变量
            </t-button>
          </t-space>
        </t-form-item>
        <!-- <t-form-item label="内存限制(MB)" name="memoryLimit">
          <t-input-number v-model="formData4.memoryLimit" :min="0" placeholder="请输入内存限制(MB)"/>
        </t-form-item>
        <t-form-item label="CPU限制" name="cpuLimit">
          <t-input-number v-model="formData4.cpuLimit" :min="0" placeholder="请输入CPU限制"/>
        </t-form-item> -->
        <t-form-item label="特权模式" name="privileged">
          <t-switch v-model="formData4.privileged" />
        </t-form-item>
        <t-form-item>
          <t-button theme="default" type="reset" variant="base">上一步</t-button>
          <t-button :loading="creating" theme="primary" type="submit">创建容器</t-button>
        </t-form-item>
      </t-form>

      <!-- 完成页面 -->
      <div v-show="activeForm === 6" class="step-form-4">
        <t-space direction="vertical" style="align-items: center">
          <t-icon name="check-circle-filled" size="52px" style="color: green" />
          <p class="text">创建成功</p>
          <p class="tips">容器配置已保存，您可以查看容器列表或继续创建新的容器</p>
          <div class="button-group">
            <t-button theme="primary" @click="onReset(0)">继续创建</t-button>
            <t-button theme="default" variant="base" @click="complete">查看列表</t-button>
          </div>
        </t-space>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ContainerConfig',
};
</script>

<script lang="ts" setup>
import type { SelectOption, SelectValue, SelectValueChangeTrigger } from 'tdesign-vue-next';
import { MessagePlugin, SubmitContext } from 'tdesign-vue-next';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { createContainer, getImageDetail, getImageList, getNetworkList } from '@/api/container';
import router from '@/router';

import {
  FORM_RULES,
  INITIAL_DATA1,
  INITIAL_DATA2,
  INITIAL_DATA3,
  INITIAL_DATA4,
  mapFormDataToRequest,
  RESTART_POLICY_OPTIONS,
} from '@/pages/docker/containers/container-create/constants';

const formData1 = ref({ ...INITIAL_DATA1 });
const formData2 = ref({ ...INITIAL_DATA2 });
const formData3 = ref({ ...INITIAL_DATA3 });
const formData4 = ref({ ...INITIAL_DATA4 });
const activeForm = ref(0);
const loading = ref(false);
const imageOptions = ref<{ label: string; value: string }[]>([]);
const networkOptions = ref<{ label: string; value: string; gateway?: string }[]>([]);
const creating = ref(false);

// 网络模式相关状态
const showNetworkConfig = ref(false);
const disablePortMappings = ref(false);

const route = useRoute();
const isEditMode = computed(() => !!route.query.containerId);
const containerInfo = computed(() => {
  if (route.query.containerInfo) {
    try {
      return JSON.parse(route.query.containerInfo as string);
    } catch (e) {
      return null;
    }
  }
  return null;
});

const fetchImageList = async () => {
  loading.value = true;
  try {
    const res = await getImageList();
    console.log('获取镜像列表响应:', res);
    if (res.code === 0) {
      imageOptions.value = res.data.map((img) => {
        const imageName = img.name || '未命名镜像';
        const imageTag = img.tag || 'latest';
        return {
          label: `${imageName}:${imageTag}`,
          value: `${imageName}:${imageTag}`,
        };
      });
    } else {
      MessagePlugin.error(res.message);
    }
  } catch (error) {
    console.error('获取镜像列表失败:', error);
    MessagePlugin.error('获取镜像列表失败');
  } finally {
    loading.value = false;
  }
};

const fetchNetworkList = async () => {
  try {
    const res = await getNetworkList();
    if (res.code === 0) {
      networkOptions.value = res.data.map((network) => {
        const gateway = network.IPAM?.Config?.[0]?.Gateway || '';
        return {
          label: network.Name || '未知网络',
          value: network.Name || '未知网络',
          gateway,
        };
      });
    } else {
      MessagePlugin.error(res.message);
    }
  } catch (error) {
    console.error('获取网络列表错误:', error);
    MessagePlugin.error('获取网络列表失败');
  }
};

const handleImageChange = async (
  value: SelectValue<SelectOption>,
  context: {
    option?: SelectOption;
    selectedOptions: SelectOption[];
    trigger: SelectValueChangeTrigger;
    e?: KeyboardEvent | MouseEvent;
  },
) => {
  if (!value) {
    formData1.value = { ...INITIAL_DATA1 };
    formData2.value = { ...INITIAL_DATA2 };
    formData3.value = { ...INITIAL_DATA3 };
    formData4.value = { ...INITIAL_DATA4 };
    return;
  }
  try {
    loading.value = true;
    const [imageName, tag] = (value as string).split(':');
    const res = await getImageDetail(imageName);
    console.log('获取镜像详情响应:', res);
    const detail = res.data;

    formData1.value = { ...INITIAL_DATA1 };
    formData2.value = { ...INITIAL_DATA2 };
    formData3.value = { ...INITIAL_DATA3 };
    formData4.value = { ...INITIAL_DATA4 };

    formData1.value.imageName = value as string;
    const randomNum = Math.floor(Math.random() * 90) + 10;
    formData1.value.containerName = `${imageName.replace(/[^a-zA-Z0-9]/g, '-')}-${randomNum}`;
    formData1.value.restartPolicy = 'always';

    if (detail) {
      const { config } = detail;
      const imageDetails = [];

      if (config.cmd && config.cmd.length > 0) {
        const cmd = Array.isArray(config.cmd) ? config.cmd.join(' ') : config.cmd;
        imageDetails.push(`默认命令: ${cmd}`);
      }

      if (config.exposedPorts && Object.keys(config.exposedPorts).length > 0) {
        imageDetails.push(`暴露端口: ${Object.keys(config.exposedPorts).join(', ')}`);
      }

      if (config.volumes && Object.keys(config.volumes).length > 0) {
        imageDetails.push(`卷: ${Object.keys(config.volumes).join(', ')}`);
      }

      if (config.env) {
        formData4.value.environmentVariables = config.env.map((env: string) => {
          const parts = env.split('=');
          const key = parts[0];
          const value = parts.slice(1).join('=');
          return { key, value: value || '' };
        });
      }

      if (config.exposedPorts) {
        formData2.value.portMappings = Object.keys(config.exposedPorts).map((port) => {
          const [portNumber, protocol] = port.split('/');
          return {
            hostPort: portNumber,
            containerPort: portNumber,
            protocol: protocol || 'tcp',
          };
        });
      }

      if (config.volumes && Object.keys(config.volumes).length > 0) {
        formData3.value.volumeMappings = Object.keys(config.volumes).map((path) => ({
          hostPath: '',
          containerPath: path,
          mode: 'rw',
        }));
      }
    }
  } catch (error) {
    console.error('获取镜像详情失败:', error);
    MessagePlugin.error('获取镜像详情失败');
  } finally {
    loading.value = false;
  }
};

const handleNetworkModeChange = async (
  value: SelectValue<SelectOption>,
  context: {
    option?: SelectOption;
    selectedOptions: SelectOption[];
    trigger: SelectValueChangeTrigger;
    e?: KeyboardEvent | MouseEvent;
  },
) => {
  const mode = value as string;
  formData2.value.ipAddress = '';
  formData2.value.gateway = '';
  formData2.value.portMappings = [];

  if (mode === 'bridge') {
    disablePortMappings.value = false;
    showNetworkConfig.value = false;

    if (formData1.value.imageName) {
      try {
        const [imageName] = formData1.value.imageName.split(':');
        const res = await getImageDetail(imageName);
        if (res.code === 0) {
          formData2.value.portMappings = Object.keys(res.config.exposedPorts).map((port) => {
            const [portNumber, protocol] = port.split('/');
            return {
              hostPort: portNumber,
              containerPort: portNumber,
              protocol: protocol || 'tcp',
            };
          });
        }
      } catch (error) {
        console.error('获取镜像端口映射失败:', error);
      }
    }
  } else if (mode === 'host' || mode === 'none') {
    disablePortMappings.value = true;
    showNetworkConfig.value = false;
  } else {
    disablePortMappings.value = false;
    showNetworkConfig.value = true;
    const selectedNetwork = networkOptions.value.find((n) => n.value === mode);
    if (selectedNetwork?.gateway) {
      formData2.value.gateway = selectedNetwork.gateway;
    }
  }
};

const addPort = () => {
  formData2.value.portMappings.push({
    hostPort: '',
    containerPort: '',
    protocol: 'tcp',
  });
};

const removePort = (index: number) => {
  formData2.value.portMappings.splice(index, 1);
};

const addVolume = () => {
  formData3.value.volumeMappings.push({
    hostPath: '',
    containerPath: '',
    mode: 'rw',
  });
};

const removeVolume = (index: number) => {
  formData3.value.volumeMappings.splice(index, 1);
};

const addEnv = () => {
  formData4.value.environmentVariables.push({
    key: '',
    value: '',
  });
};

const removeEnv = (index: number) => {
  formData4.value.environmentVariables.splice(index, 1);
};

const handleCreateContainer = async () => {
  try {
    creating.value = true;
    const request = mapFormDataToRequest(formData1.value, formData2.value, formData3.value, formData4.value);
    const res = await createContainer(request);
    if (res.code === 0) {
      MessagePlugin.success(res.message);
      router.push('/docker/containers');
    } else {
      MessagePlugin.error(res.message);
    }
  } catch (error) {
    console.error('创建容器失败:', error);
    MessagePlugin.error('创建容器失败');
  } finally {
    creating.value = false;
  }
};

const onSubmit = (result: SubmitContext, val: number) => {
  if (result.validateResult === true) {
    if (val === 6) {
      handleCreateContainer();
    } else {
      activeForm.value = val;
    }
  }
};

const onReset = (val: number) => {
  activeForm.value = val;
};

const complete = () => {
  router.replace({ path: '/docker/containers' });
};

onMounted(() => {
  fetchImageList();
  fetchNetworkList();
  if (isEditMode.value && containerInfo.value) {
    // 填充基础配置
    formData1.value = {
      imageName: containerInfo.value.image,
      containerName: containerInfo.value.name,
      restartPolicy: containerInfo.value.restart_policy,
      workingDir: containerInfo.value.working_dir || '',
      user: containerInfo.value.user || '',
      command: containerInfo.value.command || '',
    };

    // 填充网络配置
    formData2.value = {
      networkMode: containerInfo.value.network_mode,
      ipAddress: containerInfo.value.ip_address,
      gateway: containerInfo.value.gateway,
      // macAddress: containerInfo.value.mac_address,
      portMappings: containerInfo.value.ports.map((port: any) => ({
        hostPort: port.publicPort,
        containerPort: port.privatePort,
        protocol: port.type.toLowerCase(),
      })),
    };

    // 填充存储配置
    formData3.value = {
      volumeMappings: containerInfo.value.mounts.map((mount: any) => ({
        hostPath: mount.source,
        containerPath: mount.destination,
        mode: mount.rw ? 'rw' : 'ro',
      })),
    };

    // 填充环境变量
    formData4.value = {
      environmentVariables: containerInfo.value.env.map((env: string) => {
        const [key, value] = env.split('=');
        return { key, value };
      }),
      // memoryLimit: containerInfo.value.memory_limit || '',
      // cpuLimit: containerInfo.value.cpu_limit || '',
      privileged: containerInfo.value.privileged || false,
    };
  }
});
</script>

<style lang="less" scoped>
@import './index.less';
</style>
