<template>
  <div class="proxy-setting">
    <t-card class="setting-card">
      <template #header>
        <div class="card-header">
          <span>代理加速</span>
          <t-space>
            <t-button theme="primary" @click="handleSaveProxy">保存</t-button>
            <t-button theme="default" @click="onReset">重置</t-button>
          </t-space>
        </div>
      </template>
      <t-form ref="form" :data="formData" :rules="rules" @submit="onSubmit">
        <t-form-item label="代理地址" name="proxyUrl">
          <t-input v-model="formData.proxyUrl" placeholder="例如：http://proxy.example.com:8080" />
        </t-form-item>
        <t-form-item label="启用代理加速" name="proxyEnabled">
          <t-switch v-model="formData.proxyEnabled" />
        </t-form-item>
      </t-form>
    </t-card>

    <t-card class="setting-card">
      <template #header>
        <div class="card-header">
          <span>镜像加速</span>
          <t-space>
            <t-button theme="primary" @click="handleSaveMirror">保存</t-button>
            <t-button theme="default" @click="onReset">重置</t-button>
            <t-button 
              theme="primary" 
              variant="outline" 
              @click="addMirrorUrl"
              :disabled="formData.mirrorUrls.length >= MAX_MIRROR_URLS"
            >
              <t-icon name="add" />添加
            </t-button>
          </t-space>
        </div>
      </template>
      <t-form ref="mirrorForm" :data="formData" :rules="rules" @submit="onSubmit">
        <t-form-item v-for="(item, index) in formData.mirrorUrls" :key="index" :label="index === 0 ? '镜像地址' : ''" :name="`mirrorUrls.${index}.url`">
          <t-space style="width: 100%">
            <t-input v-model="item.url" placeholder="例如：https://hub.naspt.de/" style="width: 100%" />
            <t-space size="small" style="flex-shrink: 0; display: flex; align-items: center; gap: 8px">
              <t-switch v-model="item.enabled" @change="() => toggleMirrorUrl(index)" />
              <t-button 
                v-if="index !== 0"
                theme="danger" 
                variant="text" 
                @click="() => removeMirrorUrl(index)"
              >
                <t-icon name="delete" />
              </t-button>
            </t-space>
          </t-space>
        </t-form-item>
      </t-form>
    </t-card>
  </div>
</template>

<script lang="ts" setup>
import type { FormInstanceFunctions, FormRule, SubmitContext, Data as TData } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, ref } from 'vue';

import { setProxySetting, setMirrorSetting } from '@/api/system';

const MAX_MIRROR_URLS = 5;

interface Data extends TData {
  proxyEnabled: boolean;
  proxyUrl: string;
  mirrorUrls: {
    url: string;
    enabled: boolean;
  }[];
}

const form = ref<FormInstanceFunctions | null>(null);
const mirrorForm = ref<FormInstanceFunctions | null>(null);
const formData = ref<Data>({
  proxyEnabled: false,
  proxyUrl: '',
  mirrorUrls: [{ url: '', enabled: false }],
});

const rules: Record<string, FormRule[]> = {
  proxyUrl: [
    { 
      validator: (val: string) => {
        if (!val) return true;
        return /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(val);
      },
      message: '请输入正确的代理地址格式',
      type: 'error'
    }
  ],
  'mirrorUrls.0.url': [
    { required: true, message: '请输入镜像加速地址', type: 'error' },
    {
      validator: (val: string) => {
        return /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(val);
      },
      message: '请输入正确的镜像加速地址格式',
      type: 'error'
    }
  ],
  'mirrorUrls.*.url': [
    { required: true, message: '请输入镜像加速地址', type: 'error' },
    {
      validator: (val: string) => {
        return /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(val);
      },
      message: '请输入正确的镜像加速地址格式',
      type: 'error'
    }
  ],
};

const addMirrorUrl = () => {
  if (formData.value.mirrorUrls.length >= MAX_MIRROR_URLS) {
    MessagePlugin.warning('最多只能添加5个镜像加速地址');
    return;
  }
  formData.value.mirrorUrls.push({ url: '', enabled: false });
};

const removeMirrorUrl = (index: number) => {
  formData.value.mirrorUrls.splice(index, 1);
};

const toggleMirrorUrl = (index: number) => {
  formData.value.mirrorUrls.forEach((item, i) => {
    item.enabled = i === index;
  });
};

const handleSaveProxy = async () => {
  try {
    const res = await setProxySetting({
      enabled: formData.value.proxyEnabled,
      url: formData.value.proxyUrl
    });
    if (res.code === 0) {
      MessagePlugin.success('保存成功');
    } else {
      MessagePlugin.error(res.message || '保存失败');
    }
  } catch (error) {
    MessagePlugin.error('保存失败');
  }
};

const handleSaveMirror = async () => {
  try {
    const res = await setMirrorSetting({
      urls: formData.value.mirrorUrls
    });
    if (res.code === 0) {
      MessagePlugin.success('保存成功');
    } else {
      MessagePlugin.error(res.message || '保存失败');
    }
  } catch (error) {
    MessagePlugin.error('保存失败');
  }
};

const onReset = async () => {
  try {
    formData.value.proxyEnabled = false;
    formData.value.proxyUrl = '';
    formData.value.mirrorUrls = [{ url: '', enabled: false }];
    MessagePlugin.success('重置成功');
  } catch (error) {
    MessagePlugin.error('重置失败');
  }
};

onMounted(() => {
  // 加载数据
});
</script>

<style lang="less" scoped>
.proxy-setting {
  padding: 20px;
  display: flex;
  flex-direction: row;
  gap: 20px;
  height: 100%;

  .setting-card {
    width: 50%;
    height: 500px;
    overflow-y: auto;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
}
</style>
