<template>
  <div class="proxy-setting">
    <t-card title="代理设置" class="setting-card">
      <t-form ref="form" :data="formData" :rules="rules" @submit="onSubmit">
        <t-form-item label="代理地址" name="proxyUrl">
          <t-input v-model="formData.proxyUrl" placeholder="请输入代理地址，例如：http://proxy.example.com:8080" />
        </t-form-item>
        <t-form-item>
          <t-space>
            <t-button theme="primary" type="submit">保存</t-button>
            <t-button theme="default" @click="onReset">重置</t-button>
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

import { deleteSystemSetting, getSystemSetting, setSystemSetting } from '@/api/system';

interface Data extends TData {
  proxyUrl: string;
}

const form = ref<FormInstanceFunctions | null>(null);
const formData = ref<Data>({
  proxyUrl: '',
});

const rules: Record<string, FormRule[]> = {
  proxyUrl: [{ required: true, message: '请输入代理地址', type: 'error' }],
};

const loadProxySetting = async () => {
  try {
    const res = await getSystemSetting('proxy_url');
    if (res.data) {
      formData.value.proxyUrl = res.data;
    }
  } catch (error) {
    MessagePlugin.error('获取代理设置失败');
  }
};

const onSubmit = async ({ validateResult }: { validateResult: boolean | { [key: string]: any } }): Promise<void> => {
  if (validateResult === true) {
    try {
      await setSystemSetting('proxy_url', formData.value.proxyUrl);
      MessagePlugin.success('保存成功');
    } catch (error) {
      MessagePlugin.error('保存失败');
    }
  }
};

const onReset = async () => {
  try {
    await deleteSystemSetting('proxy_url');
    formData.value.proxyUrl = '';
    MessagePlugin.success('重置成功');
  } catch (error) {
    MessagePlugin.error('重置失败');
  }
};

onMounted(() => {
  loadProxySetting();
});
</script>

<style lang="less" scoped>
.proxy-setting {
  padding: 20px;

  .setting-card {
    max-width: 600px;
    margin: 0 auto;
  }
}
</style>
