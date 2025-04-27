import { request } from '@/utils/request';
import { CreateContainerParams } from '@/pages/docker/containers/container-create/constants';

/**
 * 类型定义
 */

/**
 * 容器端口配置
 */
interface Port {
  IP: string;
  PrivatePort: number;
  PublicPort: number;
  Type: string;
}

/**
 * 容器信息
 */
export interface Container {
  id: string;
  names: string[];
  image: string;
  imageId: string;
  command: string;
  state: string;
  status: string;
  ports: Port[];
  created: number;
  labels: Record<string, string>;
  sizeRw: number;
  sizeRootFs: number;
  hostConfig: {
    networkMode: string;
    restartPolicy: string;
  };
  networkSettings: {
    ipAddress: string;
  };
  mounts: {
    source: string;
    destination: string;
    readOnly: boolean;
  }[];
  [key: string]: any;
}

/**
 * 容器详情
 */
export interface ContainerDetail {
  containerId: string;
  containerName: string;
  name: string;
  imageId: string;
  imageName: string;
  createdTime: string;
  status: string;
  restartCount: number;
  restartPolicyName: string;
  restartPolicyMaxRetry: number;
  command: string;
  workingDir: string;
  entrypoints: string[];
  labels: Record<string, string>;
  envs: string[];
  volumes: string[];
  ports: string[];
  exposedPorts: string[];
  devices: string[];
  networkMode: string;
  ipAddress: string;
  state: string;
  startedAt: string;
  privileged: boolean;
  capAdd: string[];
  capDrop: string[];
  networkSettings: {
    IPAddress: string;
    Gateway: string;
    NetworkMode: string;
  };
  stats?: {
    cpuPercent: number;
    memoryUsage: number;
    memoryLimit: number;
    networkRx: number;
    networkTx: number;
    running: boolean;
  };
  code?: number;
  data?: any;
}

/**
 * 请求参数接口
 */

/**
 * 容器日志请求参数
 */
interface ContainerLogsParams {
  tail?: number;
  follow?: boolean;
  timestamps?: boolean;
}

/**
 * 容器更新请求参数
 */
interface ContainerUpdateParams {
  [key: string]: any;
}

/**
 * 响应接口
 */

/**
 * 容器列表响应
 */
interface ContainerListResponse {
  code: number;
  data: Container[];
  message: string;
}

/**
 * 镜像列表响应
 */
interface ImageListResponse {
  code: number;
  data: Array<{
    id: string; // 镜像ID
    statusId: number; // 镜像状态记录ID
    name: string; // 仓库名称
    tag: string; // 镜像标签
    size: number; // 镜像大小
    created: Date; // 创建时间
    localCreateTime: string; // 本地镜像创建时间
    remoteCreateTime: string; // 远程镜像创建时间
    needUpdate: boolean; // 是否需要更新
    lastChecked: Date; // 上次检查时间
  }>;
  message: string;
}

/**
 * 网络列表响应
 */
interface NetworkListResponse {
  code: number;
  data: Array<{
    Name: string;
    nameStr: string;
    Id: string;
    Created: string;
    Scope: string;
    Driver: string;
    EnableIPv6: boolean;
    IPAM: {
      Driver: string;
      Options: any;
      Config: Array<{
        Subnet: string;
        Gateway: string;
      }>;
    };
    Internal: boolean;
    Attachable: boolean;
    Ingress: boolean;
    ConfigFrom: any;
    ConfigOnly: boolean;
    Containers: any;
    Options: any;
    Labels: any;
  }>;
  message: string;
}

/**
 * 容器资源使用情况响应
 */
export interface ContainerStatsResponse {
  code: number;
  message: string;
  data: {
    cpuPercent: number;
    memoryUsage: number;
    memoryLimit: number;
    networkRx: number;
    networkTx: number;
    running: boolean;
  };
}

/**
 * API 函数
 */

/**
 * 容器相关 API
 */

/**
 * 获取容器列表
 * @returns 容器列表
 */
export const getContainerList = async (): Promise<Container[]> => {
  const response = await request.get<ContainerListResponse>({
    url: '/containers',
  });
  return response.data || [];
};

/**
 * 创建容器
 * @param data 容器创建参数
 * @returns 创建结果
 */
export const createContainer = async (data: CreateContainerParams): Promise<any> => {
  return request.post({
    url: '/containers',
    data,
  });
};

/**
 * 启动容器
 * @param id 容器ID
 * @returns 启动结果
 */
export const startContainer = async (id: string): Promise<any> => {
  return request.post({
    url: `/containers/start/${id}`,
  });
};

/**
 * 停止容器
 * @param id 容器ID
 * @returns 停止结果
 */
export const stopContainer = async (id: string): Promise<any> => {
  return request.post({
    url: `/containers/stop/${id}`,
  });
};

/**
 * 重启容器
 * @param id 容器ID
 * @returns 重启结果
 */
export const restartContainer = async (id: string): Promise<any> => {
  return request.post({
    url: `/containers/restart/${id}`,
  });
};

/**
 * 获取容器日志
 * @param id 容器ID
 * @param params 日志参数
 * @returns 日志内容
 */
export const getContainerLogs = async (
  id: string,
  params: ContainerLogsParams = {},
): Promise<{ data: string }> => {
  return request.get({
    url: `/containers/${id}/logs`,
    params,
  });
};

/**
 * 删除容器
 * @param id 容器ID
 * @returns 删除结果
 */
export const deleteContainer = async (id: string): Promise<any> => {
  return request.delete({
    url: `/containers/${id}`,
  });
};

/**
 * 获取容器详情
 * @param id 容器ID
 * @returns 容器详情
 */
export const getContainerDetail = async (id: string): Promise<ContainerDetail> => {
  return request.get<ContainerDetail>({
    url: `/containers/${id}/config`,
  });
};

/**
 * 更新容器
 * @param id 容器ID
 * @param data 更新数据
 * @returns 更新结果
 */
export const updateContainer = async (id: string, data: ContainerUpdateParams): Promise<any> => {
  return request.post({
    url: `/containers/update/${id}`,
    data,
  });
};

/**
 * 镜像相关 API
 */

/**
 * 获取镜像列表
 * @returns 镜像列表
 */
export const getImageList = async (): Promise<ImageListResponse> => {
  return request.get<ImageListResponse>({
    url: '/images',
  });
};

/**
 * 获取镜像详情
 * @param imageName 镜像名称
 * @returns 镜像详情
 */
export const getImageDetail = async (imageName: string): Promise<any> => {
  return request.post({
    url: '/images/detail',
    data: {
      imageName,
    },
  });
};

/**
 * 批量更新镜像
 * @param params 更新参数
 * @returns 更新结果
 */
export const batchUpdateImages = async (params: { useProxy: boolean }): Promise<any> => {
  return request.post({
    url: '/images/batch-update',
    data: params,
  });
};

/**
 * 取消镜像拉取
 * @param taskId 任务ID
 * @returns 取消结果
 */
export const cancelImagePull = async (taskId: string): Promise<any> => {
  return request.post({
    url: '/images/cancel-pull',
    data: { taskId },
  });
};

/**
 * 检查镜像更新
 * @returns 检查结果
 */
export const checkImageUpdates = async (): Promise<any> => {
  return request.post({
    url: '/images/check-updates',
  });
};

/**
 * 删除镜像
 * @param imageId 镜像ID
 * @returns 删除结果
 */
export const deleteImage = async (imageId: string): Promise<any> => {
  return request.delete({
    url: `/images/${imageId}`,
  });
};

/**
 * 更新镜像
 * @param params 更新参数
 * @returns 更新结果
 */
export const updateImage = async (params: {
  image: string;
  tag: string;
  id?: string;
  layers?: string[];
}): Promise<any> => {
  return request.post({
    url: '/images/update',
    data: params,
  });
};

/**
 * 网络相关 API
 */

/**
 * 获取网络列表
 * @returns 网络列表
 */
export const getNetworkList = async (): Promise<NetworkListResponse> => {
  return request.get<NetworkListResponse>({
    url: '/networks/list',
  });
};

/**
 * 获取容器资源使用情况
 * @param id 容器ID
 * @returns 容器资源使用情况
 */
export const getContainerStats = async (id: string): Promise<ContainerStatsResponse> => {
  return request.get<ContainerStatsResponse>({
    url: `/containers/${id}/stats`,
  });
};
