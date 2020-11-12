import { randomString } from '../utils/tools';
const cache = localStorage.getItem('bombay-cache')
  ? JSON.parse(localStorage.getItem('bombay-cache'))
  : [];
// 默认参数
export let GlobalVal = {
  lastTime: Date.now(), // 上一个记录时间
  page: '', // 当前页面
  sid: '', // session id,页面切换就会改变
  sBegin: Date.now(), // 修改sid时间
  _health: {
    errcount: 0,
    apisucc: 0,
    apifail: 0,
  },
  circle: false,
  reportCache: cache,
  cssInserted: false,
};

export function setGlobalPage(page) {
  GlobalVal.page = page;
}

export function setGlobalSid() {
  GlobalVal.sid = randomString();
  GlobalVal.sBegin = Date.now();
}

export function setGlobalHealth(type: string, success?: boolean) {
  if (type === 'error') GlobalVal._health.errcount++;
  if (type === 'api' && success) GlobalVal._health.apisucc++;
  if (type === 'api' && !success) GlobalVal._health.apifail++;
}

export function resetGlobalHealth() {
  GlobalVal._health = {
    errcount: 0,
    apisucc: 0,
    apifail: 0,
  };
}
