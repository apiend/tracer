import { Config } from '../config';
import { randomString, parseHash } from './tools';
import { GlobalVal } from '../config/global';
import { version } from '../../package.json';
import UA from 'ua-device';

// 获取公共的上传参数
export function getCommonMsg() {
  const device = getDeviceString();

  // const deviceInfo = getDeviceInfo();
  let u = (navigator as any).connection;
  let data: CommonMsg = {
    t: '',
    page: getPage(),
    hash: getHash(),
    times: 1,
    // v: Config.appVersion,
    v: `${version}`,
    token: Config.token,
    e: Config.environment,
    begin: new Date().getTime(),
    uid: getUid(),
    sid: GlobalVal.sid,
    sr: screen.width + 'x' + screen.height,
    vp: getScreen(),
    ct: u ? u.effectiveType : '',
    device,
    ul: getLang(),
    // _v: `${version}`,
    o: location.href,
    // deviceBrowser: JSON.stringify(deviceInfo.browser || {}),
    // deviceModel: JSON.stringify(deviceInfo.device || {}),
    // deviceEngine: JSON.stringify(deviceInfo.deviceEngine || {}),
    // deviceOs: JSON.stringify(deviceInfo.os || {}),
    user: JSON.stringify(Config.user),
    needPushtoKafaka: Config.needPushtoKafaka,
  };
  return data;
}

function getHash(): string {
  return location.hash;
}

// 获取当前设备相关信息
function getDeviceString(): string {
  return navigator.userAgent;
}

// function getDeviceInfo(): any {
//   return new UA(window.navigator.userAgent) || {};
// }

// 获取页面
function getPage(): string {
  if (GlobalVal.page) return GlobalVal.page;
  else {
    return location.pathname.toLowerCase();
  }
}

// 获取uid
function getUid(): string {
  let uid = localStorage.getItem('tracer_uid') || '';
  if (!uid) {
    uid = randomString();
    localStorage.setItem('tracer_uid', uid);
  }
  return uid;
}

// 获得sid
// TODO: 单页面
// function getSid() {
//   const date = new Date();
//   let sid = sessionStorage.getItem('bombay_sid') || '';
//   if (!sid) {
//       sid = randomString();
//       sessionStorage.setItem('bombay_sid', sid);
//   }
//   return sid;
// }

// 获取浏览器默认语言
function getLang() {
  var lang = navigator.language || (navigator as any).userLanguage; //常规浏览器语言和IE浏览器
  lang = lang.substr(0, 2); //截取lang前2位字符
  return lang;
}

// 获取浏览器的屏幕宽度
function getScreen() {
  let w = document.documentElement.clientWidth || document.body.clientWidth;
  let h = document.documentElement.clientHeight || document.body.clientHeight;
  return w + 'x' + h;
}