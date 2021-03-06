/// <reference path='typings/index.d.ts' />

import { Config } from './config';
import { queryString, serialize, warn } from './utils/tools';

// 上报
export function report(e: ReportData | ReportDataList) {
  if (Array.isArray(e)) {
    send(e);
  } else {
    'res' === e.t
      ? send(e)
      : 'error' === e.t
      ? send(e)
      : 'behavior' === e.t
      ? send(e)
      : 'health' === e.t &&
        window &&
        window.navigator &&
        'function' == typeof window.navigator.sendBeacon
      ? sendBeacon(e)
      : send(e);
  }
  return this;
}


// post上报
export function send(msg: ReportData | ReportDataList) {
  if (Array.isArray(msg)) {
    post(Config.reportUrlMultiple, {
      behaviorList: msg,
    });
  } else {
    
    if(Config.isPost){
      var body = msg[msg.t];
      delete msg[msg.t];
      var url = `${Config.reportUrl}?${serialize(msg)}`;
      post(url, {
        [msg.t]: body,
      });
    }else{
        // 会丢弃 res | behavior ,类型的部分参数
        new Image().src = `${Config.reportUrl}?${serialize(msg)}`
    }
    
  }

}

export function post(url, body) {
  var XMLHttpRequest = window.__oXMLHttpRequest_ || window.XMLHttpRequest;
  if (typeof XMLHttpRequest === 'function') {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', url, !0);
      xhr.setRequestHeader('Content-Type', 'text/plain');
      xhr.send(JSON.stringify(body));
    } catch (e) {
      warn('[tracer.js] Failed to log, POST请求失败');
    }
  } else {
    warn('[tracer.js] Failed to log, 浏览器不支持XMLHttpRequest');
  }
}

// 健康检查上报
export function sendBeacon(e: any) {
  'object' == typeof e && (e = serialize(e));
  e = `${Config.reportUrl}?${e}`;
  window && window.navigator && 'function' == typeof window.navigator.sendBeacon
    ? window.navigator.sendBeacon(e)
    : warn('[arms] navigator.sendBeacon not surported');
}
