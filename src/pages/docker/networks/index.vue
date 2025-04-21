<template>
  <div class="container">
    <t-card title="网络列表" :bordered="false">
      <template #actions>
        <t-button theme="primary" @click="handleCreate">创建网络</t-button>
      </template>
      <t-table
        :data="networks"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        @page-change="onPageChange"
      >
        <template #driver="{ row }">
          <t-tag :theme="row.driver === 'bridge' ? 'primary' : 'default'">
            {{ row.driver }}
          </t-tag>
        </template>
        <template #operation="{ row }">
          <t-space>
            <t-button theme="danger" variant="text" @click="handleDelete(row)">删除</t-button>
          </t-space>
        </template>
      </t-table>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, ref } from 'vue';

const networks = ref([]);
const loading = ref(false);
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
});

const columns = [
  { colKey: 'id', title: '网络ID', width: 200 },
  { colKey: 'name', title: '网络名称', width: 200 },
  { colKey: 'driver', title: '驱动', width: 100 },
  { colKey: 'scope', title: '作用域', width: 100 },
  { colKey: 'subnet', title: '子网', width: 200 },
  { colKey: 'operation', title: '操作', width: 200 },
];

const fetchNetworks = async () => {
  loading.value = true;
  try {
    // TODO: 调用后端API获取网络列表
    networks.value = [];
    pagination.value.total = 0;
  } catch (error) {
    MessagePlugin.error('获取网络列表失败');
  } finally {
    loading.value = false;
  }
};

const handleCreate = () => {
  // TODO: 实现创建网络逻辑
};

const handleDelete = (row: any) => {
  // TODO: 实现删除网络逻辑
};

const onPageChange = (pageInfo: any) => {
  pagination.value.current = pageInfo.current;
  pagination.value.pageSize = pageInfo.pageSize;
  fetchNetworks();
};

onMounted(() => {
  fetchNetworks();
});
</script>

<style scoped>
.container {
  padding: 20px;
}
</style>
