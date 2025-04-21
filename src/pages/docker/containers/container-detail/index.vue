<template>
  <div>
    <!-- 页面标题和操作按钮 -->
    <div class="header">
      <div class="title">容器详情</div>
      <t-space>
        <t-button v-if="!isEditMode" theme="primary" @click="handleEdit">编辑</t-button>
        <t-button v-else theme="default" @click="handleCancel">取消</t-button>
      </t-space>
    </div>

    <div class="form-step-container">
      <!-- 简单步骤条 -->
      <t-card :bordered="false">
        <t-steps :current="activeForm" class="step-container" status="process">
          <t-step-item content="基础配置" title="基础配置"/>
          <t-step-item content="网络设置" title="网络配置"/>
          <t-step-item content="存储设置" title="存储配置"/>
          <t-step-item content="高级设置" title="高级配置"/>
        </t-steps>
      </t-card>

      <!-- 分步表单1：基础配置 -->
      <div v-show="activeForm === 0" class="rule-tips">
        <t-alert :close="true" theme="info" title="配置说明">
          <template #message>
            <p>1. 选择要使用的容器镜像，注意版本的选择，镜像来自镜像列表，如果镜像列表中没有，请先添加镜像！</p>
            <p>2. 容器名和重启策略都为默认，如果有需要请自行设置容器名称和重启策略！</p>
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
              :disabled="true"
              @change="handleImageChange"
          />
        </t-form-item>
        <t-form-item label="容器名称" name="containerName">
          <t-input
              v-model="formData1.containerName"
              :style="{ width: '480px' }"
              :disabled="!isEditMode"
          />
        </t-form-item>
        <t-form-item label="重启策略" name="restartPolicy">
          <t-select 
              v-model="formData1.restartPolicy" 
              :style="{ width: '480px' }" 
              class="demo-select-base" 
              clearable
              :disabled="!isEditMode"
          >
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
        <t-form-item>
          <t-button theme="primary" type="submit" >下一步</t-button>
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
            :disabled="!isEditMode"
            @change="handleNetworkModeChange"
          >
            <t-option
              v-for="(item, index) in networkOptions"
              :key="index"
              :label="item.label"
              :value="item.value"
            >
              {{ item.label }}
            </t-option>
          </t-select>
        </t-form-item>
        <t-form-item v-if="showNetworkConfig" label="容器内IP" name="ipAddress">
          <t-input
            v-model="formData2.ipAddress"
            :style="{ width: '480px' }"
            :disabled="formData2.networkMode === 'bridge' || !isEditMode"
            placeholder="可选，仅在自定义网络模式下需要"
          />
        </t-form-item>
        <t-form-item v-if="showNetworkConfig" label="网关" name="gateway">
          <t-input
            v-model="formData2.gateway"
            :style="{ width: '480px' }"
            :disabled="formData2.networkMode === 'bridge' || !isEditMode"
            placeholder="可选，仅在自定义网络模式下需要"
          />
        </t-form-item>
        <t-form-item label="端口映射">
          <t-space direction="vertical" style="width: 100%">
            <div v-for="(port, index) in formData2.portMappings" :key="index" class="port-mapping">
              <t-space>
                <t-input 
                  v-model="port.hostPort" 
                  placeholder="主机端口" 
                  style="width: 200px"
                  :disabled="!isEditMode"
                />
                <t-input 
                  v-model="port.containerPort" 
                  placeholder="容器端口" 
                  style="width: 200px"
                  :disabled="!isEditMode"
                />
                <t-select 
                  v-model="port.protocol" 
                  style="width: 100px"
                  :disabled="!isEditMode"
                >
                  <t-option value="tcp">TCP</t-option>
                  <t-option value="udp">UDP</t-option>
                </t-select>
                <t-button 
                  theme="danger" 
                  variant="text" 
                  :disabled="!isEditMode"
                  @click="removePort(index)"
                >
                  <template #icon>
                    <t-icon name="delete"/>
                  </template>
                </t-button>
              </t-space>
            </div>
            <t-button 
              theme="default" 
              variant="dashed" 
              :disabled="!isEditMode"
              @click="addPort"
            >
              <template #icon>
                <t-icon name="add"/>
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
            <p>2. 设置存储限制</p>
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
                <t-input 
                  v-model="volume.hostPath" 
                  placeholder="主机路径" 
                  style="width: 200px"
                  :disabled="!isEditMode"
                />
                <t-input 
                  v-model="volume.containerPath" 
                  placeholder="容器路径" 
                  style="width: 200px"
                  :disabled="!isEditMode"
                />
                <t-select 
                  v-model="volume.mode" 
                  style="width: 100px"
                  :disabled="!isEditMode"
                >
                  <t-option value="ro">只读</t-option>
                  <t-option value="rw">读写</t-option>
                </t-select>
                <t-button 
                  theme="danger" 
                  variant="text" 
                  :disabled="!isEditMode"
                  @click="removeVolume(index)"
                >
                  <template #icon>
                    <t-icon name="delete"/>
                  </template>
                </t-button>
              </t-space>
            </div>
            <t-button 
              theme="default" 
              variant="dashed" 
              :disabled="!isEditMode"
              @click="addVolume"
            >
              <template #icon>
                <t-icon name="add"/>
              </template>
              添加路径映射
            </t-button>
          </t-space>
        </t-form-item>
        <t-form-item>
          <t-button theme="default" type="reset" variant="base">上一步</t-button>
          <t-button theme="primary" type="submit" >下一步</t-button>
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
                <t-input 
                  v-model="env.key" 
                  placeholder="变量名" 
                  style="width: 200px"
                  :disabled="!isEditMode"
                />
                <t-input 
                  v-model="env.value" 
                  placeholder="变量值" 
                  style="width: 200px"
                  :disabled="!isEditMode"
                />
                <t-button 
                  theme="danger" 
                  variant="text" 
                  :disabled="!isEditMode"
                  @click="removeEnv(index)"
                >
                  <template #icon>
                    <t-icon name="delete"/>
                  </template>
                </t-button>
              </t-space>
            </div>
            <t-button 
              theme="default" 
              variant="dashed" 
              :disabled="!isEditMode"
              @click="addEnv"
            >
              <template #icon>
                <t-icon name="add"/>
              </template>
              添加环境变量
            </t-button>
          </t-space>
        </t-form-item>
        <t-form-item label="特权模式" name="privileged">
          <t-switch v-model="formData4.privileged" :disabled="!isEditMode"/>
        </t-form-item>
        <t-form-item>
          <t-button theme="default" type="reset" variant="base">上一步</t-button>
          <t-button :loading="creating" theme="primary" type="submit" :disabled="!isEditMode">更新容器</t-button>
        </t-form-item>
      </t-form>

      <!-- 完成页面 -->
      <div v-show="activeForm === 6" class="step-form-4">
        <t-space direction="vertical" style="align-items: center">
          <t-icon name="check-circle-filled" size="52px" style="color: green"/>
          <p class="text">更新成功</p>
          <p class="tips">容器配置已更新，您可以查看容器列表或继续编辑</p>
          <div class="button-group">
            <t-button theme="primary" @click="onReset(0)">继续编辑</t-button>
            <t-button theme="default" variant="base" @click="complete">查看列表</t-button>
          </div>
        </t-space>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ContainerDetail',
};
</script>

<script lang="ts" setup>
import type {SelectOption, SelectValue, SelectValueChangeTrigger} from 'tdesign-vue-next';
import {MessagePlugin, SubmitContext} from 'tdesign-vue-next';
import {computed, onMounted, ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';

import {createContainer, getContainerDetail, getImageDetail, getImageList, getNetworkList, updateContainer} from '@/api/container';

import {
  FORM_RULES,
  INITIAL_DATA1,
  INITIAL_DATA2,
  INITIAL_DATA3,
  INITIAL_DATA4,
  NETWORK_OPTIONS,
  RESTART_POLICY_OPTIONS,
  mapFormDataToRequest,
} from './constants';

const formData1 = ref({...INITIAL_DATA1});
const formData2 = ref({...INITIAL_DATA2});
const formData3 = ref({...INITIAL_DATA3});
const formData4 = ref({...INITIAL_DATA4});
const activeForm = ref(0);
const loading = ref(false);
const imageOptions = ref<{ label: string; value: string }[]>([]);
const networkOptions = ref<{ label: string; value: string; gateway?: string }[]>([]);
const creating = ref(false);
const isEditMode = ref(false);

// 网络模式相关状态
const showNetworkConfig = ref(false);
const disablePortMappings = ref(false);

const route = useRoute();
const router = useRouter();

// 获取容器详情
const fetchContainerDetail = async () => {
  try {
    loading.value = true;
    const res = await getContainerDetail(route.query.id as string);
    if (res.code === 0) {
      const containerDetail = res.data;
      
      // 填充基础配置
      formData1.value = {
        imageName: containerDetail.image,
        containerName: containerDetail.name,
        restartPolicy: containerDetail.restartPolicy,
        workingDir: containerDetail.workingDir || '',
        user: containerDetail.user || '',
        command: containerDetail.command || '',
      };

      // 填充网络配置
      formData2.value = {
        networkMode: containerDetail.networkMode,
        ipAddress: containerDetail.ipAddress,
        gateway: containerDetail.gateway,
        portMappings: containerDetail.portMappings || [],
      };

      // 填充存储配置
      formData3.value = {
        volumeMappings: containerDetail.volumeMappings || [],
      };

      // 填充环境变量
      formData4.value = {
        environmentVariables: containerDetail.environmentVariables || [],
        privileged: containerDetail.privileged || false,
      };

      // 获取镜像列表
      await fetchImageList();
      
      // 获取网络列表
      await fetchNetworkList();
    } else {
      MessagePlugin.error('获取容器详情失败');
    }
  } catch (error) {
    MessagePlugin.error('获取容器详情失败');
  } finally {
    loading.value = false;
  }
};

// 获取镜像列表
const fetchImageList = async () => {
  try {
    loading.value = true;
    const res = await getImageList();
    console.log('11111111');

    if (res.code === 0) {
      imageOptions.value = res.data.map((image: any) => ({
        label: `${image.name}:${image.tag}`,
        value: `${image.name}:${image.tag}`,
      }));
    } else {
      MessagePlugin.error('获取镜像列表失败');
    }
  } catch (error) {
    MessagePlugin.error('获取镜像列表失败');
  } finally {
    loading.value = false;
  }
};

// 获取网络列表
const fetchNetworkList = async () => {
  try {
    const res = await getNetworkList();
    if (res.code === 0) {
      networkOptions.value = res.data.map((network: any) => {
        const gateway = network.IPAM?.Config?.[0]?.Gateway || '';
        return {
          label: network.Name || '未知网络',
          value: network.Name || '未知网络',
          gateway: gateway,
        };
      });
    } else {
      MessagePlugin.error('获取网络列表失败');
    }
  } catch (error) {
    console.error('获取网络列表错误:', error);
    MessagePlugin.error('获取网络列表失败');
  }
};

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
    formData1.value = {...INITIAL_DATA1};
    formData2.value = {...INITIAL_DATA2};
    formData3.value = {...INITIAL_DATA3};
    formData4.value = {...INITIAL_DATA4};
    return;
  }
  try {
    loading.value = true;
    const [imageName, tag] = (value as string).split(':');
    const res = await getImageDetail(imageName);
    if (res.code === 0) {
      formData1.value = {...INITIAL_DATA1};
      formData2.value = {...INITIAL_DATA2};
      formData3.value = {...INITIAL_DATA3};
      formData4.value = {...INITIAL_DATA4};

      formData1.value.imageName = value as string;
      
      const randomNum = Math.floor(Math.random() * 90) + 10;
      formData1.value.containerName = `${imageName.replace(/[^a-zA-Z0-9]/g, '-')}-${randomNum}`;
      formData1.value.restartPolicy = 'always';

      if (res.data.config) {
        const {config} = res.data;

        if (config.env) {
          formData4.value.environmentVariables = config.env.map((env: string) => {
            const parts = env.split('=');
            const key = parts[0];
            const value = parts.slice(1).join('=');
            return {key, value: value || ''};
          });
        }
      }
    }
  } catch (error) {
    MessagePlugin.error('获取镜像详情失败');
  } finally {
    loading.value = false;
  }
};

// 处理网络模式变化
const handleNetworkModeChange = (
  value: SelectValue<SelectOption>,
  context: {
    option?: SelectOption;
    selectedOptions: SelectOption[];
    trigger: SelectValueChangeTrigger;
    e?: KeyboardEvent | MouseEvent;
  },
) => {
  const mode = value as string;
  if (mode === 'host') {
    disablePortMappings.value = true;
    showNetworkConfig.value = false;
  } else if (mode === 'none') {
    disablePortMappings.value = true;
    showNetworkConfig.value = false;
  } else if (mode === 'bridge') {
    disablePortMappings.value = false;
    showNetworkConfig.value = false;
  } else {
    disablePortMappings.value = false;
    showNetworkConfig.value = true;
  }
};

// 添加端口映射
const addPort = () => {
  formData2.value.portMappings.push({
    hostPort: '',
    containerPort: '',
    protocol: 'tcp',
  });
};

// 删除端口映射
const removePort = (index: number) => {
  formData2.value.portMappings.splice(index, 1);
};

// 添加数据卷映射
const addVolume = () => {
  formData3.value.volumeMappings.push({
    hostPath: '',
    containerPath: '',
    mode: 'rw',
  });
};

// 删除数据卷映射
const removeVolume = (index: number) => {
  formData3.value.volumeMappings.splice(index, 1);
};

// 添加环境变量
const addEnv = () => {
  formData4.value.environmentVariables.push({
    key: '',
    value: '',
  });
};

// 删除环境变量
const removeEnv = (index: number) => {
  formData4.value.environmentVariables.splice(index, 1);
};

// 更新容器
const handleUpdateContainer = async () => {
  try {
    creating.value = true;
    const request = mapFormDataToRequest(
      formData1.value,
      formData2.value,
      formData3.value,
      formData4.value
    );

    const res = await updateContainer(route.query.id as string, request);
    if (res.code === 0) {
      MessagePlugin.success('更新容器成功');
      router.push('/docker/containers');
    } else {
      MessagePlugin.error(res.message || '更新容器失败');
    }
  } catch (error) {
    MessagePlugin.error('更新容器失败');
  } finally {
    creating.value = false;
  }
};

// 创建容器
const handleCreateContainer = async () => {
  try {
    creating.value = true;
    const request = mapFormDataToRequest(
      formData1.value,
      formData2.value,
      formData3.value,
      formData4.value
    );

    const res = await createContainer(request);
    if (res.code === 0) {
      MessagePlugin.success('创建容器成功');
      router.push('/docker/containers');
    } else {
      MessagePlugin.error(res.message || '创建容器失败');
    }
  } catch (error) {
    MessagePlugin.error('创建容器失败');
  } finally {
    creating.value = false;
  }
};

const onSubmit = (result: SubmitContext, val: number) => {
  if (result.validateResult === true) {
    if (val === 6) {
      if (route.query.id) {
        handleUpdateContainer();
      } else {
        handleCreateContainer();
      }
    } else {
      activeForm.value = val;
    }
  }
};

const onReset = (val: number) => {
  activeForm.value = val;
};

const complete = () => {
  router.replace({path: '/docker/containers'});
};

const handleEdit = () => {
  isEditMode.value = true;
};

const handleCancel = () => {
  isEditMode.value = false;
};

// 页面加载时获取容器详情
onMounted(() => {
  if (route.query.id) {
    fetchContainerDetail();
  } else {
    fetchImageList();
    fetchNetworkList();
  }
});
</script>

<style lang="less" scoped>
@import './index.less';

/* 页面头部样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 20px;
}

/* 标题样式 */
.title {
  font-size: 20px;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

/* 表单步骤容器样式 */
.form-step-container {
  padding: 20px;
}
</style>
