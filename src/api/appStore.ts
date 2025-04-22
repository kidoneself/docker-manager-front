import { request } from '@/utils/request';
import { AppStoreApp, AppStoreAppDetail, AppStoreInstallLog, AppStoreServiceStatus } from './model/appStoreModel';

const Api = {
  AppList: '/api/app-store/apps',
  AppDetail: '/api/app-store/apps',
  AppInstall: '/api/app-store/apps',
  InstallStatus: '/api/app-store/install',
};

/**
 * 获取应用列表
 * @param params 查询参数
 * @returns 应用列表和总数
 */
export function getAppList(params: {
  page: number;
  pageSize: number;
  search?: string;
  category?: string;
}) {
  return request.get<{
    total: number;
    list: AppStoreApp[];
  }>({
    url: Api.AppList,
    params,
  });
}

/**
 * 获取应用详情
 * @param id 应用ID
 * @returns 应用详情信息
 */
export function getAppDetail(id: string) {
  return request.get<AppStoreAppDetail>({
    url: `${Api.AppDetail}/${id}`,
  });
}

/**
 * 安装应用
 * @param id 应用ID
 * @param data 安装配置
 * @returns 安装任务ID
 */
export function installApp(id: string, data: {
  selectedServices: string[];
  envValues: Record<string, string>;
}) {
  return request.post<{ taskId: string }>({
    url: `${Api.AppInstall}/${id}/install`,
    data,
  });
}

/**
 * 获取安装状态
 * @param taskId 安装任务ID
 * @returns 安装状态信息
 */
export function getInstallStatus(taskId: string) {
  return request.get<{
    status: 'waiting' | 'running' | 'completed' | 'failed';
    logs: AppStoreInstallLog[];
    services: AppStoreServiceStatus[];
  }>({
    url: `${Api.InstallStatus}/${taskId}/status`,
  });
}

/**
 * 取消安装
 * @param taskId 安装任务ID
 * @returns 取消结果
 */
export function cancelInstall(taskId: string) {
  return request.post<{ success: boolean }>({
    url: `${Api.InstallStatus}/${taskId}/cancel`,
  });
} 