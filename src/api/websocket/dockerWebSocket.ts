import { ref } from 'vue';
import type { WebSocketMessage } from '../websocket';

/**
 * Docker WebSocket服务
 * 用于处理与后端的WebSocket通信
 */
export class DockerWebSocketService {
    private ws: WebSocket | null = null;
    private messageHandlers: Map<string, Function[]> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private wsUrl: string;
    
    constructor() {
        // 根据环境选择 WebSocket 地址
        const isDev = import.meta.env.DEV;
        this.wsUrl = isDev 
            ? 'ws://localhost:8080/ws/docker'  // 开发环境
            : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/docker`;  // 生产环境
        this.connect();
    }
    
    /**
     * 建立WebSocket连接
     */
    private connect() {
        this.ws = new WebSocket(this.wsUrl);
        
        this.ws.onopen = () => {
            console.log('WebSocket连接已建立');
            this.reconnectAttempts = 0;
        };
        
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
        };
        
        this.ws.onclose = () => {
            this.handleReconnect();
        };
    }
    
    /**
     * 处理重连
     */
    private handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => this.connect(), 3000);
        }
    }
    
    /**
     * 处理接收到的消息
     * @param message 接收到的消息
     */
    private handleMessage(message: any) {
        const handlers = this.messageHandlers.get(message.type) || [];
        handlers.forEach(handler => handler(message));
    }
    
    /**
     * 注册消息处理器
     * @param type 消息类型
     * @param handler 处理函数
     */
    public on(type: string, handler: Function) {
        if (!this.messageHandlers.has(type)) {
            this.messageHandlers.set(type, []);
        }
        this.messageHandlers.get(type)?.push(handler);
    }
    
    /**
     * 移除消息处理器
     * @param type 消息类型
     * @param handler 处理函数
     */
    public off(type: string, handler: Function) {
        const handlers = this.messageHandlers.get(type) || [];
        const index = handlers.indexOf(handler);
        if (index > -1) {
            handlers.splice(index, 1);
        }
    }
    
    /**
     * 发送消息
     * @param message 要发送的消息
     */
    public send(message: any): Promise<WebSocketMessage> {
        return new Promise((resolve, reject) => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                // 创建一个一次性的消息处理器
                const messageHandler = (response: WebSocketMessage) => {
                    if (response.type === 'PULL_START') {
                        this.off('PULL_START', messageHandler);
                        resolve(response);
                    }
                };
                
                // 注册处理器
                this.on('PULL_START', messageHandler);
                
                // 发送消息
                this.ws.send(JSON.stringify(message));
            } else {
                reject(new Error('WebSocket连接未就绪'));
            }
        });
    }
    
    /**
     * 检查镜像是否存在
     * @param images 要检查的镜像列表
     */
    public checkImages(images: { name: string; tag: string }[]) {
        this.send({
            type: 'INSTALL_CHECK_IMAGES',
            data: images
        });
    }
    
    /**
     * 校验安装参数
     * @param params 要校验的参数
     */
    public validateParams(params: { ports?: { hostPort: number }[]; paths?: { hostPath: string }[] }) {
        this.send({
            type: 'INSTALL_VALIDATE',
            data: params
        });
    }
}

// 创建单例实例
export const dockerWebSocketService = new DockerWebSocketService(); 