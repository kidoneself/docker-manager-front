import type { AxiosRequestConfig } from 'axios';

import { request } from '@/utils/request';

export interface SystemSettingResponse {
  data: string;
  code: number;
  message: string;
}

/**
 * 获取系统设置
 * @param key 设置项的键
 */
export function getSystemSetting(key: string) {
  return request.get<SystemSettingResponse>({
    url: `/system/settings?key=${key}`,
  } as AxiosRequestConfig);
}

/**
 * 设置系统设置
 * @param key 设置项的键
 * @param value 设置项的值
 */
export function setSystemSetting(key: string, value: string) {
  return request.post<SystemSettingResponse>({
    url: `/system/settings?key=${key}&value=${value}`,
  } as AxiosRequestConfig);
}

/**
 * 更新系统设置
 * @param key 设置项的键
 * @param value 设置项的值
 */
export function updateSystemSetting(key: string, value: string) {
  return request.put<SystemSettingResponse>({
    url: `/system/settings?key=${key}&value=${value}`,
  } as AxiosRequestConfig);
}

/**
 * 删除系统设置
 * @param key 设置项的键
 */
export function deleteSystemSetting(key: string) {
  return request.delete<SystemSettingResponse>({
    url: `/system/settings?key=${key}`,
  } as AxiosRequestConfig);
}
