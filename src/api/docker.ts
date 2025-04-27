import { WebSocketClient, WebSocketMessage } from './websocket';

export interface PullImageParams {
  imageName: string;
}

export interface PullImageProgress {
  progress: number;
  status: string;
  layers?: any[];
}

export interface DockerWebSocketCallbacks {
  onStart?: (taskId: string) => void;
  onProgress?: (progress: PullImageProgress) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

class DockerWebSocketAPI {
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

  public disconnect(): void {
    this.wsClient?.disconnect();
    this.wsClient = null;
  }
}

export const dockerWebSocketAPI = new DockerWebSocketAPI(); 