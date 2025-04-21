import { FormRule } from 'tdesign-vue-next'; // 端口映射类型

// 端口映射类型
export interface PortMapping {
  hostPort: number;
  containerPort: number;
  protocol?: string;
}

// 卷映射类型
export interface VolumeMapping {
  hostPath: string;
  containerPath: string;
  readOnly: boolean;
}

// 环境变量类型
export interface EnvironmentVariable {
  key: string;
  value: string;
}

// 网络模式选项
export const NETWORK_OPTIONS = [
  { value: 'bridge', label: '桥接模式', description: '默认网络模式，容器通过桥接网络与外部通信' },
  { value: 'host', label: '主机模式', description: '容器使用主机网络，无需端口映射，性能更好' },
  { value: 'none', label: '禁用网络', description: '容器没有网络连接' },
  { value: 'container', label: '容器模式', description: '与指定容器共享网络命名空间' },
  { value: 'macvlan', label: 'Macvlan模式', description: '分配MAC地址，使容器显示为物理设备' },
  { value: 'ipvlan', label: 'IPvlan模式', description: '共享宿主MAC地址，分配IP地址' },
  { value: 'custom', label: '自定义网络', description: '使用用户创建的自定义网络' },
];

// 重启策略选项
export const RESTART_POLICY_OPTIONS = [
  { value: 'no', label: '不重启', description: '容器退出后不自动重启' },
  { value: 'always', label: '总是重启', description: '容器退出后总是重启，包括手动停止' },
  { value: 'unless-stopped', label: '除非手动停止', description: '容器退出后自动重启，除非手动停止' },
  { value: 'on-failure', label: '失败时重启', description: '容器非正常退出时自动重启' },
];

// 表单验证规则
export const FORM_RULES: Record<string, FormRule[]> = {
  image: [{ required: true, message: '请选择镜像', type: 'error' }],
  name: [{ required: true, message: '请输入容器名称', type: 'error' }],
  restartPolicy: [{ required: true, message: '请选择重启策略', type: 'error' }],
  networkMode: [{ required: true, message: '请选择网络模式', type: 'error' }],
};

// 容器表单接口
export interface ContainerForm {
  image: string;
  name: string;
  restartPolicy: string;
  networkMode: string;
  portMappings: PortMapping[];
  volumeMappings: VolumeMapping[];
  environmentVariables: EnvironmentVariable[];
  privileged: boolean;
  ipAddress?: string;
  gateway?: string;
  memoryLimit?: string;
  cpuLimit?: string;
  volumeMounts?: Array<{
    hostPath: string;
    containerPath: string;
    readOnly: boolean;
  }>;
}

// 表单初始数据
export const INITIAL_DATA: ContainerForm = {
  image: '',
  name: '',
  restartPolicy: 'always',
  networkMode: 'bridge',
  portMappings: [],
  volumeMappings: [],
  environmentVariables: [],
  privileged: false,
  ipAddress: '',
  gateway: '',
  memoryLimit: '',
  cpuLimit: '',
  volumeMounts: []
};
