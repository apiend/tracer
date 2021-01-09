// 默认参数
export let Config = {
  // 上报地址
  reportUrl: 'http://localhost:7002',
  // 批量上报地址 当配置了这个字段的时候，会将用户行为集成加载
  reportUrlMultiple: '',
  // 最长缓存长度
  maxCacheLength: 20,
  // 是否为 post 的方式进行上报 默认是 true  当是 false 的时候通过 new Image() 方法上报,兼容好点,但会丢失用户行为数据
  isPost:false,
  // 提交参数
  token: '',
  // app版本
  appVersion: '1.0.0',
  // 环境
  environment: 'production',
  // 脚本延迟上报时间
  outtime: 300,
  // 开启单页面？
  enableSPA: true,
  // 是否自动上报pv
  autoSendPv: true,
  // 是否上报页面性能数据
  isPage: true,
  // 是否上报ajax性能数据
  isAjax: true,
  // 是否上报页面资源数据
  isResource: true,
  // 是否上报错误信息
  isError: true,
  // NOTE: 是否录屏 功能暂未开发后续 可通过插件的形式 实现
  isRecord: false,
  // 是否记录停留时长
  isCountStayTime: true,
  // 是否上报行为 如果是行为上报则需要通过 post 的方式 上报
  isBehavior: true,
  ignore: {
    ignoreErrors: [],
    ignoreUrls: [],
    ignorePvs: ['404'],
    ignoreResources: [],
    ignoreApis: ['/api/v1/report/web', 'livereload.js?snipver=1', '/sockjs-node/info'],
    ignoreBehaviorEles: [],
  },
  behavior: {
    console: ['debug', 'error'], // 取值可以是"debug", "info", "warn", "log", "error"
    click: true,
  },
  // 最长上报数据长度 ( ajax 返回值的时候用使用)
  maxLength: 100,
  // 是否有Vue传入
  Vue: '',
  // 用户信息
  user: {},
  // 定义用户多少毫秒不操作认为不在线 (默认10分钟)
  offlineTime: 10 * 60 * 1000,
  // 多少时间上传一次用户停留
  sendMill: 30 * 1000,
  // 是否需要推送相关信息到java后台的kafaka
  needPushtoKafaka: false,
};

// 设置参数
export function setConfig(options) {
  const ignore = {
    ...Config.ignore,
    ...options.ignore,
  };
  Config = {
    ...Config,
    ...options,
    ignore,
  };
}

export function getConfig(e: string) {
  return e ? (Config[e] ? Config[e] : {}) : {};
}