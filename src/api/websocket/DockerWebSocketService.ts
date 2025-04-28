import { WebSocketClient } from './WebSocketClient';
import type { 
  WebSocketMessage, 
  PullImageParams, 
  PullImageProgress, 
  DockerWebSocketCallbacks,
  DockerImage
} from './types';

export class DockerWebSocketService {
  private wsClient: WebSocketClient | null = null;
  private readonly wsUrl: string;

  constructor() {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.wsUrl = `${wsProtocol}//${window.location.host}/ws/docker`;
  }

  public async pullImage(params: PullImageParams, callbacks: DockerWebSocketCallbacks): Promise<void> {
    try {
      // 创建 WebSocket 客户端
      this.wsClient = new WebSocketClient({
        url: this.wsUrl,
        onMessage: (message: WebSocketMessage) => {
          switch (message.type) {
            case 'PULL_START':
              callbacks.onStart?.(message.taskId);
              break;
            case 'PULL_PROGRESS':
              callbacks.onProgress?.(message.data);
              break;
            case 'PULL_COMPLETE':
              callbacks.onComplete?.();
              break;
            case 'ERROR':
              callbacks.onError?.(message.data.error);
              break;
            default:
              console.warn('未知的消息类型:', message.type);
          }
        },
        onError: (error) => {
          callbacks.onError?.(error instanceof Error ? error.message : 'WebSocket错误');
        },
        onClose: () => {
          callbacks.onError?.('WebSocket连接已关闭');
        }
      });

      // 连接 WebSocket
      await this.wsClient.connect();

      // 发送拉取请求
      const pullRequest: WebSocketMessage = {
        type: 'PULL_IMAGE',
        taskId: '',
        data: params
      };

      this.wsClient.send(pullRequest);
    } catch (error) {
      callbacks.onError?.(error instanceof Error ? error.message : '拉取镜像失败');
      throw error;
    }
  }

  public async cancelPull(taskId: string): Promise<void> {
    if (!this.wsClient) {
      throw new Error('WebSocket未连接');
    }

    const cancelRequest: WebSocketMessage = {
      type: 'CANCEL_PULL',
      taskId,
      data: {}
    };

    this.wsClient.send(cancelRequest);
  }

  public async checkImageUpdates(images: DockerImage[]): Promise<void> {
    try {
      // 创建 WebSocket 客户端
      this.wsClient = new WebSocketClient({
        url: this.wsUrl,
        onMessage: (message: WebSocketMessage) => {
          switch (message.type) {
            case 'CHECK_UPDATES_COMPLETE':
              // 更新镜像列表中的更新状态
              if (message.data) {
                const updateInfo = message.data;
                images.forEach(img => {
                  const imageKey = `${img.name}:${img.tag}`;
                  const imageUpdateInfo = updateInfo[imageKey];
                  if (imageUpdateInfo) {
                    img.needUpdate = imageUpdateInfo.hasUpdate;
                    img.lastChecked = new Date().toISOString();
                  }
                });
              }
              break;
            case 'ERROR':
              console.error('检查更新失败:', message.data.error);
              break;
            default:
              console.warn('未知的消息类型:', message.type);
          }
        },
        onError: (error) => {
          console.error('WebSocket错误:', error);
        },
        onClose: () => {
          console.warn('WebSocket连接已关闭');
        }
      });

      // 连接 WebSocket
      await this.wsClient.connect();

      // 发送检查更新请求
      const checkUpdatesRequest: WebSocketMessage = {
        type: 'CHECK_IMAGE_UPDATES',
        taskId: '',
        data: { images }
      };

      this.wsClient.send(checkUpdatesRequest);
    } catch (error) {
      console.error('检查镜像更新失败:', error);
      throw error;
    }
  }

  public disconnect(): void {
    this.wsClient?.disconnect();
    this.wsClient = null;
  }
}

// 创建单例实例
export const dockerWebSocketService = new DockerWebSocketService(); 