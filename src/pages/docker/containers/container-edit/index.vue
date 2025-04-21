<template>
  <div>
    <div class="form-step-container">
      <!-- 简单步骤条 -->
      <t-card :bordered="false">
        <t-steps class="step-container" :current="activeForm" status="process">
          <t-step-item title="基础配置" content="基础配置" />
          <t-step-item title="网络配置" content="网络设置" />
          <t-step-item title="存储配置" content="存储设置" />
          <t-step-item title="高级配置" content="高级设置" />
        </t-steps>
      </t-card>

      <!-- 分步表单1：基础配置 -->
      <div v-show="activeForm === 0" class="rule-tips">
        <t-alert theme="info" title="配置说明" :close="true">
          <template #message>
            <p>1. 选择要使用的容器镜像</p>
            <p>2. 设置容器名称和重启策略</p>
            <p>3. 配置工作目录和启动命令</p>
          </template>
        </t-alert>
      </div>
      <t-form
        v-show="activeForm === 0"
        class="step-form"
        :data="formData"
        :rules="FORM_RULES"
        label-align="right"
        @submit="(result: SubmitContext) => onSubmit(result, 1)"
      >
        <t-form-item label="容器镜像" name="image">
          <t-select
            v-model="formData.image"
            :style="{ width: '480px' }"
            class="demo-select-base"
            clearable
            :loading="loading"
            :options="imageOptions"
            @change="handleImageChange"
          />
        </t-form-item>
        <t-form-item label="容器名称" name="name">
          <t-input v-model="formData.name" :style="{ width: '480px' }" />
        </t-form-item>
        <t-form-item label="重启策略" name="restartPolicy">
          <t-select v-model="formData.restartPolicy" :style="{ width: '480px' }" class="demo-select-base" clearable>
            <t-option
              v-for="(item, index) in RESTART_POLICY_OPTIONS"
              :key="index"
              :value="item.value"
              :label="item.label"
            >
              {{ item.label }}
            </t-option>
          </t-select>
        </t-form-item>
        <t-form-item>
          <t-button theme="primary" type="submit">下一步</t-button>
        </t-form-item>
      </t-form>

      <!-- 分步表单2：网络配置 -->
      <div v-show="activeForm === 1" class="rule-tips">
        <t-alert theme="info" title="配置说明" :close="true">
          <template #message>
            <p>1. 选择网络模式</p>
            <p>2. 配置网络参数</p>
            <p>3. 设置端口映射</p>
          </template>
        </t-alert>
      </div>
      <t-form
        v-show="activeForm === 1"
        class="step-form"
        :data="formData"
        :rules="FORM_RULES"
        label-align="left"
        @reset="onReset(0)"
        @submit="(result: SubmitContext) => onSubmit(result, 2)"
      >
        <t-form-item label="网络模式" name="networkMode">
          <t-select v-model="formData.networkMode" :style="{ width: '480px' }" class="demo-select-base" clearable>
            <t-option v-for="(item, index) in NETWORK_OPTIONS" :key="index" :value="item.value" :label="item.label">
              {{ item.label }}
            </t-option>
          </t-select>
        </t-form-item>
        <t-form-item label="容器内IP" name="ipAddress">
          <t-input
            v-model="formData.ipAddress"
            disabled
            :style="{ width: '480px' }"
            placeholder="可选，仅在自定义网络模式下需要"
          />
        </t-form-item>
        <t-form-item label="容器网关" name="gateway">
          <t-input
            v-model="formData.gateway"
            disabled
            :style="{ width: '480px' }"
            placeholder="可选，仅在自定义网络模式下需要"
          />
        </t-form-item>
        <!--        <t-form-item label="MAC地址" name="macAddress">-->
        <!--          <t-input-->
        <!--            v-model="formData2.macAddress"-->
        <!--            :style="{ width: '480px' }"-->
        <!--            placeholder="可选，仅在自定义网络模式下需要"-->
        <!--          />-->
        <!--        </t-form-item>-->
        <t-form-item label="端口映射">
          <t-space direction="vertical" style="width: 100%">
            <div v-for="(port, index) in formData.portMappings" :key="index" class="port-mapping">
              <t-space>
                <t-input-number v-model="port.hostPort" theme="normal" align="right" max="65535">
                  <template #label><span>主机端口：</span></template>
                </t-input-number>
                <t-input-number v-model="port.containerPort" theme="normal" align="right" max="65535">
                  <template #label><span>容器端口：</span></template>
                </t-input-number>
                <t-select v-model="port.protocol" style="width: 100px">
                  <t-option value="tcp">TCP</t-option>
                  <t-option value="udp">UDP</t-option>
                </t-select>
                <t-button theme="danger" variant="text" @click="removePort(index)">
                  <template #icon>
                    <t-icon name="delete" />
                  </template>
                </t-button>
              </t-space>
            </div>
            <t-button theme="default" variant="dashed" @click="addPort">
              <template #icon>
                <t-icon name="add" />
              </template>
              添加端口映射
            </t-button>
          </t-space>
        </t-form-item>
        <t-form-item>
          <t-button type="reset" theme="default" variant="base">上一步</t-button>
          <t-button theme="primary" type="submit">下一步</t-button>
        </t-form-item>
      </t-form>

      <!-- 分步表单3：存储配置 -->
      <div v-show="activeForm === 2" class="rule-tips">
        <t-alert theme="info" title="配置说明" :close="true">
          <template #message>
            <p>1. 配置数据卷映射</p>
            <p>2. 设置挂载权限</p>
          </template>
        </t-alert>
      </div>
      <t-form
        v-show="activeForm === 2"
        class="step-form"
        :data="formData"
        :rules="FORM_RULES"
        label-align="left"
        @reset="onReset(1)"
        @submit="(result: SubmitContext) => onSubmit(result, 3)"
      >
        <t-form-item label="数据卷映射">
          <t-space direction="vertical" style="width: 100%">
            <div v-for="(volume, index) in formData.volumeMappings" :key="index" class="volume-mapping">
              <t-space>
                <t-input v-model="volume.hostPath" placeholder="主机路径" style="width: 200px" />
                <t-input v-model="volume.containerPath" placeholder="容器路径" style="width: 200px" />
                <t-select v-model="volume.readOnly" style="width: 100px">
                  <t-option :value="true">只读</t-option>
                  <t-option :value="false">读写</t-option>
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
          <t-button type="reset" theme="default" variant="base">上一步</t-button>
          <t-button theme="primary" type="submit">下一步</t-button>
        </t-form-item>
      </t-form>

      <!-- 分步表单4：高级配置 -->
      <div v-show="activeForm === 3" class="rule-tips">
        <t-alert theme="info" title="配置说明" :close="true">
          <template #message>
            <p>1. 配置环境变量</p>
            <p>2. 设置资源限制</p>
            <p>3. 配置特权模式</p>
          </template>
        </t-alert>
      </div>
      <t-form
        v-show="activeForm === 3"
        class="step-form"
        :data="formData"
        :rules="FORM_RULES"
        label-align="left"
        @reset="onReset(2)"
        @submit="(result: SubmitContext) => onSubmit(result, 6)"
      >
        <t-form-item label="环境变量">
          <t-space direction="vertical" style="width: 100%">
            <div v-for="(env, index) in formData.environmentVariables" :key="index" class="env-variable">
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
        <t-form-item label="特权模式" name="privileged">
          <t-switch v-model="formData.privileged" />
        </t-form-item>
        <t-form-item label="内存限制" name="memoryLimit">
          <t-input v-model="formData.memoryLimit" :style="{ width: '480px' }" placeholder="例如：512m, 1g" />
          <t-alert v-if="showMemoryWarning" theme="warning" :message="memoryWarningMessage" />
        </t-form-item>
        <t-form-item label="CPU限制" name="cpuLimit">
          <t-input v-model="formData.cpuLimit" :style="{ width: '480px' }" placeholder="例如：0.5, 1" />
          <t-alert v-if="showCpuWarning" theme="warning" :message="cpuWarningMessage" />
        </t-form-item>
        <t-form-item>
          <t-button type="reset" theme="default" variant="base">上一步</t-button>
          <t-button theme="primary" type="submit" :loading="creating">创建容器</t-button>
        </t-form-item>
      </t-form>

      <!-- 完成页面 -->
      <div v-show="activeForm === 6" class="step-form-4">
        <t-space direction="vertical" style="align-items: center">
          <t-icon name="check-circle-filled" style="color: green" size="52px" />
          <p class="text">创建成功</p>
          <p class="tips">容器配置已保存，您可以查看容器列表或继续创建新的容器</p>
          <div class="button-group">
            <t-button theme="primary" @click="onReset(0)">继续创建</t-button>
            <t-button variant="base" theme="default" @click="complete">查看列表</t-button>
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

<script setup lang="ts">
import type { SelectOption, SelectValue, SelectValueChangeTrigger } from 'tdesign-vue-next';
import { MessagePlugin, SubmitContext } from 'tdesign-vue-next';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { createContainer, getContainerDetail, getImageDetail, updateContainer } from '@/api/container';

import {
  ContainerForm,
  EnvironmentVariable,
  FORM_RULES,
  INITIAL_DATA,
  NETWORK_OPTIONS,
  PortMapping,
  RESTART_POLICY_OPTIONS,
  VolumeMapping,
} from './constants';

const formData = ref<ContainerForm>({ ...INITIAL_DATA });
const activeForm = ref(0);
const loading = ref(false);
const imageOptions = ref<{ label: string; value: string }[]>([]);
const creating = ref(false);

// 网络模式相关状态
const showNetworkConfig = ref(false);
const disablePortMappings = ref(false);

// 资源限制相关状态
const showMemoryWarning = computed(() => {
  if (!formData.value.memoryLimit) return false;
  const memory = Number(formData.value.memoryLimit);
  return memory < 128;
});

const memoryWarningMessage = computed(() => {
  if (!formData.value.memoryLimit) return '';
  const memory = Number(formData.value.memoryLimit);
  if (memory < 128) {
    return '内存限制过低，建议至少设置为128MB';
  }
  return '';
});

const showCpuWarning = computed(() => {
  if (!formData.value.cpuLimit) return false;
  const cpu = Number(formData.value.cpuLimit);
  return cpu < 0.1;
});

const cpuWarningMessage = computed(() => {
  if (!formData.value.cpuLimit) return '';
  const cpu = Number(formData.value.cpuLimit);
  if (cpu < 0.1) {
    return 'CPU限制过低，建议至少设置为0.1';
  }
  return '';
});

const route = useRoute();

const isEditMode = computed(() => !!route.query.id);

// 页面加载时获取镜像列表和router实例
const router = useRouter();
onMounted(() => {
  getContainerDetail(route.query.id).then((res) => {
    const containerDetail = res.data;
    console.log(containerDetail);
    if (isEditMode.value && containerDetail) {
      // 填充容器表单数据
      formData.value = {
        image: containerDetail.image,
        name: containerDetail.name,
        restartPolicy: containerDetail.restartPolicy,
        networkMode: containerDetail.networkMode,
        ipAddress: containerDetail.networkSettings?.IPAddress || '',
        gateway: containerDetail.gateway || '',
        portMappings: containerDetail.portMappings.map((port: any) => ({
          hostPort: port.hostPort,
          containerPort: port.containerPort,
          protocol: port.type?.toLowerCase() || 'tcp',
        })),
        volumeMappings:
          containerDetail.volumeMappings?.map((mount: any) => ({
            hostPath: mount.hostPath,
            containerPath: mount.containerPath,
            readOnly: !mount.readOnly,
          })) || [],
        environmentVariables:
          containerDetail.envList?.map((env: string) => {
            const parts = env.split('=');
            const key = parts[0];
            const value = parts.slice(1).join('=');
            return { key, value };
          }) || [],
        privileged: containerDetail.privileged || false,
        memoryLimit: containerDetail.memoryLimit || '',
        cpuLimit: containerDetail.cpuLimit || '',
        volumeMounts: containerDetail.volumeMounts || []
      };
    }
  });
});

// 处理镜像选择变化
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
    // 清空所有表单数据
    formData.value = { ...INITIAL_DATA };
    return;
  }
  try {
    loading.value = true;
    const res = await getImageDetail(value as string);
    if (res.code === 0) {
      // 先清空所有表单数据
      formData.value = { ...INITIAL_DATA };

      // 设置当前选择的镜像
      formData.value.image = value as string;

      // 自动填充表单数据
      if (res.data.config) {
        const { config } = res.data;

        // 显示镜像详细信息
        const imageDetails = [];

        // 显示入口点信息
        if (config.entrypoint && config.entrypoint.length > 0) {
          const entrypoint = Array.isArray(config.entrypoint) ? config.entrypoint.join(' ') : String(config.entrypoint);
          imageDetails.push(`入口点: ${entrypoint}`);
        }

        // 显示命令信息
        if (config.cmd && config.cmd.length > 0) {
          const cmd = Array.isArray(config.cmd) ? config.cmd.join(' ') : String(config.cmd);
          imageDetails.push(`默认命令: ${cmd}`);
        }

        // 显示暴露端口信息
        if (config.exposedPorts && Object.keys(config.exposedPorts).length > 0) {
          imageDetails.push(`暴露端口: ${Object.keys(config.exposedPorts).join(', ')}`);
        }

        // 显示卷信息
        if (config.volumes && Object.keys(config.volumes).length > 0) {
          imageDetails.push(`卷: ${Object.keys(config.volumes).join(', ')}`);
        }

        // 显示镜像信息提示
        if (imageDetails.length > 0) {
          MessagePlugin.info({
            content: `镜像信息:\n${imageDetails.join('\n')}`,
            duration: 8000,
            closeBtn: true,
          });
        } else {
          MessagePlugin.success('获取镜像详情成功');
        }

        // 自动填充环境变量
        if (config.env) {
          formData.value.environmentVariables = config.env.map((env: string) => {
            const parts = env.split('=');
            const key = parts[0];
            const value = parts.slice(1).join('='); // 处理值中可能包含=的情况
            return { key, value: value || '' };
          });
        }

        // 自动填充端口映射
        if (config.exposedPorts) {
          formData.value.portMappings = Object.keys(config.exposedPorts).map((port) => {
            const [portNumber, protocol] = port.split('/');
            return {
              hostPort: parseInt(portNumber),
              containerPort: parseInt(portNumber),
              protocol: protocol || 'tcp',
            };
          });
        }

        // 自动填充卷挂载
        if (config.volumes && Object.keys(config.volumes).length > 0) {
          formData.value.volumeMappings = Object.keys(config.volumes).map((path) => {
            return {
              hostPath: '', // 用户需要填写主机路径
              containerPath: path,
              readOnly: false,
            };
          });
        }
      }
    } else {
      MessagePlugin.error('获取镜像详情失败');
    }
  } catch (error) {
    MessagePlugin.error('获取镜像详情失败');
  } finally {
    loading.value = false;
  }
};

const addPort = () => {
  formData.value.portMappings.push({
    hostPort: 0,
    containerPort: 0,
  });
};

const removePort = (index: number) => {
  formData.value.portMappings.splice(index, 1);
};

const addVolume = () => {
  formData.value.volumeMappings.push({
    hostPath: '',
    containerPath: '',
    readOnly: false,
  });
};

const removeVolume = (index: number) => {
  formData.value.volumeMappings.splice(index, 1);
};

const addEnv = () => {
  formData.value.environmentVariables.push({
    key: '',
    value: '',
  });
};

const removeEnv = (index: number) => {
  formData.value.environmentVariables.splice(index, 1);
};

// 创建容器
const handleCreateContainer = async () => {
  try {
    creating.value = true;
    const request = {
      // 镜像信息
      image: formData.value.image,
      tag: 'latest', // 默认使用latest标签
      autoPull: false,

      // 容器基本信息
      name: formData.value.name,
      autoRemove: false,
      restartPolicy: formData.value.restartPolicy,

      // 网络配置
      portMappings: formData.value.portMappings.map((p) => ({
        hostPort: String(p.hostPort),
        containerPort: String(p.containerPort),
        protocol: p.protocol,
        ip: '',
      })),
      networkMode: formData.value.networkMode,
      ipAddress: formData.value.ipAddress || '',
      gateway: formData.value.gateway || '',

      // 存储配置
      volumeMappings: formData.value.volumeMappings.map((v) => ({
        hostPath: v.hostPath,
        containerPath: v.containerPath,
        readOnly: v.readOnly,
      })),

      // 环境变量
      environmentVariables: formData.value.environmentVariables,

      // 安全配置
      privileged: formData.value.privileged,

      // 资源限制
      memoryLimit: formData.value.memoryLimit || '',
      cpuLimit: formData.value.cpuLimit || '',

      // 卷挂载
      volumeMounts: formData.value.volumeMounts || []
    };

    if (isEditMode.value) {
      // 更新容器
      const res = await updateContainer(route.query.id, request);
      if (res.code === 0) {
        MessagePlugin.success('更新容器成功');
        router.push('/docker/containers');
      } else {
        MessagePlugin.error(res.message || '更新容器失败');
      }
    } else {
      // 创建新容器
      const res = await createContainer(request);
      if (res.code === 0) {
        MessagePlugin.success('创建容器成功');
        router.push('/docker/containers');
      } else {
        MessagePlugin.error(res.message || '创建容器失败');
      }
    }
  } catch (error) {
    MessagePlugin.error(isEditMode.value ? '更新容器失败' : '创建容器失败');
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
  const router = useRouter();
  router.replace({ path: '/docker/containers' });
};

// 处理网络模式变化
const handleNetworkModeChange = (mode: string) => {
  if (mode === 'host') {
    // host模式不需要端口映射和其他网络配置
    disablePortMappings.value = true;
    showNetworkConfig.value = false;
  } else if (mode === 'none') {
    // none模式完全禁用网络
    disablePortMappings.value = true;
    showNetworkConfig.value = false;
  } else if (mode === 'bridge') {
    // bridge模式需要端口映射，不需要其他网络配置
    disablePortMappings.value = false;
    showNetworkConfig.value = false;
  } else {
    // 自定义网络模式可能需要各种配置
    disablePortMappings.value = false;
    showNetworkConfig.value = true;
  }
};
</script>

<style lang="less" scoped>
@import './index.less';
</style>
