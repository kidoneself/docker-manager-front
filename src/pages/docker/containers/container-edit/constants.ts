import {FormRule} from 'tdesign-vue-next';
import { ContainerDetail } from '@/api/container';

// 添加校验结果类型
export interface ValidationResult {
    valid: boolean;
    message: string;
}

// 端口映射类型
export interface PortMapping {
    hostPort: string;
    containerPort: string;
    protocol: string;
    ip: string;
    validationResult?: ValidationResult;
}

// 卷映射类型
export interface VolumeMapping {
    hostPath: string;
    containerPath: string;
    readOnly: boolean;
}

// 设备映射类型
export interface DeviceMapping {
    hostPath: string;
    containerPath: string;
}

// 环境变量类型
export interface EnvironmentVariable {
    key: string;
    value: string;
}

// 标签类型
export interface Label {
    key: string;
    value: string;
}

// 健康检查类型
export interface HealthCheck {
    test: string[];
    interval: string;
    timeout: string;
    retries: number;
    startPeriod: string;
}

// 创建容器请求参数类型
export interface CreateContainerParams {
    // 镜像信息
    image: string;
    tag: string;
    autoPull?: boolean;

    // 容器基本信息
    name: string;
    autoRemove?: boolean;
    restartPolicy?: string;

    // 网络配置
    portMappings: Array<{
        ip?: string;
        hostPort: string;
        containerPort: string;
        protocol?: string;
    }>;
    networkMode?: string;
    dns?: string[];
    dnsSearch?: string[];
    extraHosts?: string[];
    ipAddress?: string;
    macAddress?: string;

    // 存储配置
    volumeMounts: Array<{
        hostPath: string;
        containerPath: string;
        readOnly: boolean;
    }>;
    tmpfs?: string[];
    shmSize?: string;

    // 环境变量
    environmentVariables: Array<{
        key: string;
        value: string;
    }>;

    // 资源限制
    memory?: number;
    memorySwap?: number;
    cpuShares?: number;
    cpuPeriod?: number;
    cpuQuota?: number;
    cpusetCpus?: string;

    // 安全配置
    privileged?: boolean;
    capAdd?: string[];
    capDrop?: string[];
    securityOpt?: string[];
    devices?: string[];

    // 进程配置
    user?: string;
    groupAdd?: string[];
    workingDir?: string;
    command?: string;
    entrypoint?: string[];
    stopSignal?: string;
    stopTimeout?: number;

    // 其他配置
    labels?: Record<string, string>;
    ipcMode?: string;
    pidMode?: string;
    utsMode?: string;
    sysctls?: Record<string, string>;
    healthcheck?: HealthCheck;
}

// 镜像选项
export const IMAGE_OPTIONS = [
    {label: 'nginx', value: 'nginx'},
    {label: 'mysql', value: 'mysql'},
    {label: 'redis', value: 'redis'},
    {label: 'postgres', value: 'postgres'},
];

export const TYPE_OPTIONS = [
    {label: '开发环境', value: 'dev'},
    {label: '测试环境', value: 'test'},
    {label: '生产环境', value: 'prod'},
];

// 网络模式选项
export const NETWORK_OPTIONS = [
    {value: 'bridge', label: '桥接模式', description: '默认网络模式，容器通过桥接网络与外部通信'},
    {value: 'host', label: '主机模式', description: '容器使用主机网络，无需端口映射，性能更好'},
    {value: 'none', label: '禁用网络', description: '容器没有网络连接'},
    {value: 'container', label: '容器模式', description: '与指定容器共享网络命名空间'},
    {value: 'macvlan', label: 'Macvlan模式', description: '分配MAC地址，使容器显示为物理设备'},
    {value: 'ipvlan', label: 'IPvlan模式', description: '共享宿主MAC地址，分配IP地址'},
    {value: 'custom', label: '自定义网络', description: '使用用户创建的自定义网络'},
];

// 重启策略选项
export const RESTART_POLICY_OPTIONS = [
    {value: 'no', label: '不重启', description: '容器退出后不自动重启'},
    {value: 'always', label: '总是重启', description: '容器退出后总是重启，包括手动停止'},
    {value: 'unless-stopped', label: '除非手动停止', description: '容器退出后自动重启，除非手动停止'},
    {value: 'on-failure', label: '失败时重启', description: '容器非正常退出时自动重启'},
];

// 表单验证规则
export const FORM_RULES: Record<string, FormRule[]> = {
    image: [{required: true, message: '请选择镜像', type: 'error'}],
    name: [{required: true, message: '请输入容器名称', type: 'error'}],
    restartPolicy: [{required: true, message: '请选择重启策略', type: 'error'}],
    networkMode: [{required: true, message: '请选择网络模式', type: 'error'}],
};

// 容器表单接口
export interface ContainerForm {
    // 镜像信息
    image: string;
    tag: string;
    autoPull: boolean;

    // 容器基本信息
    name: string;
    autoRemove: boolean;
    restartPolicy: string;

    // 网络配置
    portMappings: PortMapping[];
    networkMode: string;
    ipAddress: string;
    gateway: string;

    // 存储配置
    volumeMappings: VolumeMapping[];
    devices: DeviceMapping[];

    // 环境变量
    environmentVariables: EnvironmentVariable[];

    // 安全配置
    privileged: boolean;
    capAdd: string[];
    capDrop: string[];

    // 资源限制
    memoryLimit: string;
    cpuLimit: string;

    // 高级配置
    entrypoint: string[];
    cmd: string[];
    workingDir: string;
    user: string;
    labels: Label[];
    healthcheck: HealthCheck;
}

// 表单初始数据
export const INITIAL_DATA: ContainerForm = {
    // 镜像信息
    image: '',
    tag: 'latest',
    autoPull: false,

    // 容器基本信息
    name: '',
    autoRemove: false,
    restartPolicy: 'always',

    // 网络配置
    portMappings: [],
    networkMode: 'bridge',
    ipAddress: '',
    gateway: '',

    // 存储配置
    volumeMappings: [],
    devices: [],

    // 环境变量
    environmentVariables: [],

    // 安全配置
    privileged: false,
    capAdd: [],
    capDrop: [],

    // 资源限制
    memoryLimit: '',
    cpuLimit: '',

    // 高级配置
    entrypoint: [],
    cmd: [],
    workingDir: '',
    user: '',
    labels: [],
    healthcheck: {
        test: [],
        interval: '30s',
        timeout: '10s',
        retries: 3,
        startPeriod: '0s'
    }
};

// 表单数据到请求对象的转换函数
export function mapFormDataToRequest(formData: ContainerForm): CreateContainerParams {
    return {
        // 镜像信息
        image: formData.image,
        tag: formData.tag,
        autoPull: formData.autoPull,

        // 容器基本信息
        name: formData.name,
        autoRemove: formData.autoRemove,
        restartPolicy: formData.restartPolicy,

        // 网络配置
        portMappings: formData.portMappings.map(p => ({
            hostPort: p.hostPort,
            containerPort: p.containerPort,
            protocol: p.protocol,
            ip: p.ip || ''
        })),
        networkMode: formData.networkMode,
        ipAddress: formData.ipAddress,
        dns: [],
        dnsSearch: [],
        extraHosts: [],
        macAddress: '',

        // 存储配置
        volumeMounts: formData.volumeMappings.map(v => ({
            hostPath: v.hostPath,
            containerPath: v.containerPath,
            readOnly: v.readOnly
        })),
        tmpfs: [],
        shmSize: '',

        // 环境变量
        environmentVariables: formData.environmentVariables,

        // 资源限制
        memory: formData.memoryLimit ? parseInt(formData.memoryLimit) : undefined,
        memorySwap: undefined,
        cpuShares: formData.cpuLimit ? parseInt(formData.cpuLimit) : undefined,
        cpuPeriod: undefined,
        cpuQuota: undefined,
        cpusetCpus: '',

        // 安全配置
        privileged: formData.privileged,
        capAdd: formData.capAdd,
        capDrop: formData.capDrop,
        securityOpt: [],
        devices: [],

        // 进程配置
        user: formData.user,
        groupAdd: [],
        workingDir: formData.workingDir,
        command: formData.cmd.join(' '),
        entrypoint: formData.entrypoint,
        stopSignal: '',
        stopTimeout: undefined,

        // 其他配置
        labels: formData.labels.reduce((acc, label) => {
            if (label.key && label.value) {
                acc[label.key] = label.value;
            }
            return acc;
        }, {} as Record<string, string>),
        ipcMode: '',
        pidMode: '',
        utsMode: '',
        sysctls: {},
        healthcheck: formData.healthcheck
    };
}

// 从容器详情到表单数据的映射函数
export function mapContainerDetailToForm(detail: ContainerDetail): ContainerForm {
  return {
    // 镜像信息
    image: detail.imageName.split(':')[0],
    tag: detail.imageName.split(':')[1] || 'latest',
    autoPull: false,

    // 容器基本信息
    name: detail.containerName,
    autoRemove: false,
    restartPolicy: detail.restartPolicyName,

    // 网络配置
    portMappings: detail.ports.map((port: string) => {
      const [containerPort, hostPort] = port.split(':');
      const [portNumber, protocol] = containerPort.split('/');
      return {
        hostPort,
        containerPort: portNumber,
        protocol: protocol || 'tcp',
        ip: ''
      };
    }),
    networkMode: detail.networkMode,
    ipAddress: detail.ipAddress,
    gateway: '',

    // 存储配置
    volumeMappings: detail.volumes.map((volume: any) => ({
      hostPath: volume.hostPath,
      containerPath: volume.containerPath,
      readOnly: volume.readOnly
    })),
    devices: detail.devices.map((device: any) => ({
      hostPath: device.hostPath,
      containerPath: device.containerPath
    })),

    // 环境变量
    environmentVariables: detail.envs.map((env: string) => {
      const [key, value] = env.split('=');
      return { key, value };
    }),

    // 安全配置
    privileged: detail.privileged,
    capAdd: [],
    capDrop: [],

    // 资源限制
    memoryLimit: '',
    cpuLimit: '',

    // 高级配置
    entrypoint: detail.entrypoints,
    cmd: detail.command.split(' '),
    workingDir: detail.workingDir,
    user: '',
    labels: Object.entries(detail.labels).map(([key, value]) => ({ key, value: value as string })),
    healthcheck: {
      test: [],
      interval: '30s',
      timeout: '10s',
      retries: 3,
      startPeriod: '0s'
    }
  };
}
