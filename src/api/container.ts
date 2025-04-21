import { request } from '@/utils/request';
import { CreateContainerParams } from '@/pages/docker/containers/container-create/constants';

interface Port {
  IP: string;
  PrivatePort: number;
  PublicPort: number;
  Type: string;
}

export interface Container {
  Id: string;
  Names: string[];
  Image: string;
  State: string;
  Status: string;
  Ports: Port[];
  Created: number;
  [key: string]: any;
}

// // 容器相关接口
// interface ContainerListParams {
// }

// 获取容器列表
export function getContainerList() {
  return request
    .get<Container[] | { data: Container[] }>({
      url: '/containers',
    })
    .then((response) => {
      if (Array.isArray(response)) {
        return response;
      }
      if (response?.data) {
        return response.data;
      }
      return [];
    });
}

// 创建容器
export function createContainer(data: CreateContainerParams) {
  return request.post({
    url: '/containers',
    data,
  });
}

// 启动容器
export const startContainer = async (id: string) => {
  return request.post({
    url: `/containers/start/${id}`,
  });
};

// 停止容器
export const stopContainer = async (id: string) => {
  return request.post({
    url: `/containers/stop/${id}`,
  });
};

// 重启容器
export const restartContainer = async (id: string) => {
  return request.post({
    url: `/containers/restart/${id}`,
  });
};

// 获取容器日志
export const getContainerLogs = async (
  id: string,
  params: {
    tail?: number;
    follow?: boolean;
    timestamps?: boolean;
  } = {},
) => {
  return request.get({
    url: `/containers/${id}/logs`,
    params,
  });
};

// 删除容器
export function deleteContainer(id: string) {
  return request.delete({
    url: `/containers/${id}`,
  });
}

// 获取容器详情
export function getContainerDetail(id: string) {
  return request.get<Container>({
    url: `/containers/${id}/config`,
  });
}

interface ImagePullParams {
  image: string;
  tag?: string;
  useProxy: boolean;
}

interface ImageListResponse {
  code: number;
  data: Array<{
    id: string; // 镜像ID
    name: string; // 镜像名称
    tag: string; // 标签
    size: number; // 大小
    created: string; // 创建时间
    needUpdate: boolean; // 是否需要更新
    digest?: string; // 摘要
    remoteDigest?: string; // 远程摘要
    lastChecked?: string; // 上次检查时间
  }>;
  message: string;
}

// 获取镜像列表
export function getImageList() {
  return request.get<ImageListResponse>({
    url: '/images',
  });
}

// 拉取镜像
export function pullImage(data: ImagePullParams) {
  return request.post({
    url: '/images/pull',
    data,
  });
}

// 获取镜像拉取进度
export function getImagePullProgress(id: string) {
  return request.get({
    url: `/images/pull/progress/${id}`,
  });
}

// 删除镜像
export function deleteImage(id: string) {
  return request.delete({
    url: `/images/${id}`,
  });
}

// 取消镜像拉取
export function cancelImagePull(taskId: string) {
  return request.post({
    url: `/images/pull/cancel/${taskId}`,
  });
}

// 检查镜像更新
export function checkImageUpdates() {
  return request.post({
    url: '/images/check-updates',
  });
}

// 批量更新镜像
export function batchUpdateImages(params: { useProxy: boolean }) {
  return request.post({
    url: '/images/batch-update',
    params,
  });
}

// 更新单个镜像
export function updateImage(data: { image: string; tag: string; useProxy: boolean }) {
  return request.post({
    url: '/images/update',
    data,
  });
}

interface NetworkCreateParams {
  name: string;
  driver: string;
  subnet?: string;
}

interface NetworkListRespose {
  code: number;
  data: Array<{
    Name: string;
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

// 获取网络列表
export function getNetworkList() {
  return request.get<NetworkListRespose>({
    url: '/networks/list',
  });
}

// 创建网络
export function createNetwork(data: NetworkCreateParams) {
  return request.post({
    url: '/docker/networks',
    data,
  });
}

// 删除网络
export function deleteNetwork(id: string) {
  return request.delete({
    url: `/docker/networks/${id}`,
  });
}

// 存储卷相关接口
interface VolumeListParams {
  page: number;
  pageSize: number;
}

interface VolumeCreateParams {
  name: string;
  driver?: string;
}

interface VolumeListResponse {
  list: Array<{
    name: string;
    driver: string;
    mountpoint: string;
    created: string;
  }>;
  total: number;
}

// 获取存储卷列表
export function getVolumeList(params: VolumeListParams) {
  return request.get<VolumeListResponse>({
    url: '/docker/volumes',
    params,
  });
}

// 创建存储卷
export function createVolume(data: VolumeCreateParams) {
  return request.post({
    url: '/docker/volumes',
    data,
  });
}

// 删除存储卷
export function deleteVolume(name: string) {
  return request.delete({
    url: `/docker/volumes/${name}`,
  });
}

// 仓库相关接口
export interface Registry {
  registry: string;
  username: string;
  password: string;
}

// 获取仓库列表
export function getRegistries() {
  return request.get({
    url: '/docker/registries',
  });
}

// 添加仓库
export function addRegistry(data: Registry) {
  return request.post({
    url: '/docker/registries',
    data,
  });
}

// 删除仓库
export function deleteRegistry(registry: string) {
  return request.delete({
    url: `/docker/registries/${registry}`,
  });
}

// 登录仓库
export function loginDockerRegistry(data: Registry) {
  return request.post({
    url: '/docker/login',
    data,
  });
}

// 登出仓库
export function logoutDockerRegistry(registry: string) {
  return request.post({
    url: '/docker/logout',
    data: { registry },
  });
}

// 获取登录状态
export function getLoginStatus(registry: string) {
  return request.get({
    url: '/docker/login/status',
    params: { registry },
  });
}

// Docker 登录接口
export interface DockerLoginRequest {
  username: string;
  password: string;
  serverAddress: string;
}

// Docker 登录
export function dockerLogin(data: DockerLoginRequest) {
  return request.post({
    url: '/docker/auth/login',
    data,
  });
}

// 更新容器
export function updateContainer(id: string, data: any) {
  return request.post({
    url: `/containers/update/${id}`,
    data,
  });
}

// 测试代理延迟
export const testProxyLatency = () => {
  return request.get({
    url: '/images/proxy/test',
  });
};

/**
 * 获取镜像详情
 * @param imageName 镜像名称
 */
export function getImageDetail(imageName: string) {
  return request.post({
    url: '/images/detail',
    data: {
      imageName,
    },
  });
}
