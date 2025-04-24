import { ref } from 'vue';

/**
 * Docker WebSocket服务
 * 用于处理与后端的WebSocket通信
 */
export class DockerWebSocketService {
    private ws: WebSocket | null = null;
    private messageHandlers: Map<string, Function[]> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    
    constructor() {
        this.connect();
    }
    
    /**
     * 建立WebSocket连接
     */
    private connect() {
        this.ws = new WebSocket('ws://localhost:8080/ws/docker');
        
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
    public send(message: any) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }
}

// 创建单例实例
export const dockerWebSocketService = new DockerWebSocketService(); 