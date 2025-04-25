import {FormRule} from 'tdesign-vue-next';

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
    validationResult?: ValidationResult;
}

// 卷映射类型
export interface VolumeMapping {
    hostPath: string;
    containerPath: string;
    mode: string;
    isDefaultVolume?: boolean; // 标记是否为镜像默认卷
    validationResult?: ValidationResult;
}

// 环境变量类型
export interface EnvironmentVariable {
    key: string;
    value: string;
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
        mode?: string;
        readOnly?: boolean;
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
    imageName: [{required: true, message: '请选择镜像', type: 'error'}],
    containerName: [{required: true, message: '请输入容器名称', type: 'error'}],
    restartPolicy: [{required: true, message: '请选择重启策略', type: 'error'}],
    workingDir: [{required: false, message: '请输入工作目录', type: 'error'}],
    user: [{required: false, message: '请输入用户', type: 'error'}],
    command: [{required: false, message: '请输入命令', type: 'error'}],
    networkMode: [{required: true, message: '请选择网络模式', type: 'error'}],
    ipAddress: [{required: false, message: '请输入IP地址', type: 'error'}],
    gateway: [{required: false, message: '请输入网关', type: 'error'}],
    macAddress: [{required: false, message: '请输入MAC地址', type: 'error'}],
    memoryLimit: [{required: false, message: '请输入内存限制', type: 'error'}],
    cpuLimit: [{required: false, message: '请输入CPU限制', type: 'error'}],
};

// 第一步表单初始数据：基础配置
export const INITIAL_DATA1 = {
    imageName: '',
    containerName: '',
    restartPolicy: 'always',
    workingDir: '',
    user: '',
    command: '',
};

// 第二步表单初始数据：网络配置
export const INITIAL_DATA2 = {
    networkMode: 'bridge',
    ipAddress: '',
    gateway: '',
    portMappings: [] as PortMapping[],
};

// 第三步表单初始数据：存储配置
export const INITIAL_DATA3 = {
    volumeMappings: [] as VolumeMapping[],
};

// 第四步表单初始数据：高级配置
export const INITIAL_DATA4 = {
    environmentVariables: [] as { key: string; value: string }[],
    memoryLimit: '',
    cpuLimit: '',
    privileged: false,
};


// 表单数据到请求对象的转换函数
export function mapFormDataToRequest(
    formData1: typeof INITIAL_DATA1,
    formData2: typeof INITIAL_DATA2,
    formData3: typeof INITIAL_DATA3,
    formData4: typeof INITIAL_DATA4,
): CreateContainerParams {
    // 分割镜像名称和标签
    const [image, tag = 'latest'] = formData1.imageName.split(':');

    return {
        // 镜像信息
        image,
        tag,
        autoPull: false,

        // 容器基本信息
        name: formData1.containerName,
        autoRemove: false,
        restartPolicy: formData1.restartPolicy || 'always',

        // 网络配置
        portMappings: formData2.portMappings.map((p) => ({
            hostPort: p.hostPort,
            containerPort: p.containerPort,
            protocol: p.protocol || 'tcp',
            ip: '',
        })),
        networkMode: formData2.networkMode || 'bridge',
        ipAddress: formData2.ipAddress,
        dns: [],
        dnsSearch: [],
        extraHosts: [],

        // 存储配置
        volumeMounts: formData3.volumeMappings.map((v) => ({
            hostPath: v.hostPath,
            containerPath: v.containerPath,
            mode: v.mode || 'rw',
            readOnly: v.mode === 'ro',
        })),

        // 环境变量
        environmentVariables: formData4.environmentVariables.map((e) => ({
            key: e.key,
            value: e.value,
        })),

        // 进程配置
        command: formData1.command,

        // 安全配置
        privileged: formData4.privileged || false,
    };
}
