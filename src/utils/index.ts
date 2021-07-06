import { Config } from '../config';
import { randomString, parseHash } from './tools';
import { GlobalVal } from '../config/global';
import { version } from '../../package.json';
import UA from 'ua-device';

// 获取公共的上传参数
export function getCommonMsg() {

  // const device = getDeviceString();
  // const deviceInfo = getDeviceInfo();

  // 2020-12-21 17:33:32
  const tempinfo = getDeviceInfo2()
  const device = tempinfo.deviceModel + "|" + tempinfo.deviceOs + "|" + tempinfo.wechat;

  let u = (navigator as any).connection;
  let data: CommonMsg = {
    t: '',
    page: getPage(),
    hash: getHash(),
    // times: 1,
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
    // o: location.href,
    o: b64EncodeUnicode(encodeURIComponent(location.href)),
    // deviceBrowser: JSON.stringify(deviceInfo.browser || {}),
    // deviceModel: JSON.stringify(deviceInfo.device || {}),
    // deviceEngine: JSON.stringify(deviceInfo.deviceEngine || {}),
    // deviceOs: JSON.stringify(deviceInfo.os || {}),
    user: JSON.stringify(Config.user),
    // needPushtoKafaka: Config.needPushtoKafaka,
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

// 使用库 太大了
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


/**
 *  add:  通过 navigator.userAgent 
 *  - 优先获取手机信息
 */
function getDeviceInfo2(): deviceMsg {

  let userAgent = navigator.userAgent

  let weblog: deviceMsg = {}

  let isModel
  // 微信判断
  let m1 = userAgent.match(/MicroMessenger.*?(?= )/)
  if (m1 && m1.length > 0) {
    weblog.wechat = m1[0]
  }

  // 苹果手机
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    // 获取设备名
    if (userAgent.includes('iPad')) {
      weblog.deviceModel = 'iPad'
    } else {
      weblog.deviceModel = 'iPhone'
    }
    // 获取操作系统版本
    m1 = userAgent.match(/iPhone OS .*?(?= )/)
    if (m1 && m1.length > 0) {
      weblog.deviceOs = m1[0]
    }
    isModel = "ios"
  }

  // 安卓手机
  if (userAgent.includes('Android')) {
    // 获取设备名
    m1 = userAgent.match(/Android.*; ?(.*(?= Build))/)
    if (m1 && m1.length > 1) {
      weblog.deviceModel = m1[1]
    }
    // 获取操作系统版本
    m1 = userAgent.match(/Android.*?(?=;)/)
    if (m1 && m1.length > 0) {
      weblog.deviceOs = m1[0]
    }
    isModel = "Android"
  }
  // PC端 简单化处理
  if (!isModel) {
    weblog.deviceModel = "pc"
    weblog.deviceOs = "pc"
    weblog.wechat = "other"
  }



  return weblog
}
 
// TODO: parse mail
// Encoding UTF8 ⇢ base64
export function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode(parseInt(p1, 16))
    }))
}
// b64EncodeUnicode('✓ à la mode') // "4pyTIMOgIGxhIG1vZGU="
// b64EncodeUnicode('\n') // "Cg=="

// Decoding base64 ⇢ UTF8
// function b64DecodeUnicode(str) {
//     return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
//         return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
//     }).join(''))
// }
