/// <reference path='typings/index.d.ts' />

import { Config, getConfig } from './config';
import {
  each,
  parseHash,
  warn,
  splitGroup,
  on,
  off,
  isInIframe,
  findIndex,
  checkEdge,
  replacerFunc
} from './utils/tools';
import { getCommonMsg, b64EncodeUnicode } from './utils/index';
import { report } from './reporter';
import {
  setGlobalPage,
  setGlobalSid,
  setGlobalHealth,
  GlobalVal,
  resetGlobalHealth,
} from './config/global';

const CIRCLECLS = 'bombayjs-circle-active'; // circle class类名
const CIRCLESTYLEID = 'bombayjs-circle-css'; // 插入的style标签id
// 处理pv
export function handlePv(): void {
  if (!Config.autoSendPv) return;
  let commonMsg = getCommonMsg();
  if (Config.ignore.ignorePvs.includes(commonMsg.page)) {
    return;
  }
  let msg: pvMsg = {
    ...commonMsg,
    ...{
      t: 'pv',
      dt: document.title,
      dl: encodeURIComponent(location.href),
      // dr: document.referrer,
      dr: encodeURIComponent(document.referrer),
      dpr: window.devicePixelRatio,
      de: document.charset,
    },
  };
  report(msg);
}

// 处理html node
const normalTarget = function (e) {
  var t,
    n,
    r,
    a,
    i,
    o = [];
  if (!e || !e.tagName) return '';
  if (
    (o.push(e.tagName.toLowerCase()),
      e.id && o.push('#'.concat(e.id)),
      (t = e.className) && '[object String]' === Object.prototype.toString.call(t))
  ) {
    for (n = t.split(/\s+/), i = 0; i < n.length; i++) {
      // className包含active的不加入路径
      if (n[i].indexOf('active') < 0) o.push('.'.concat(n[i]));
    }
  }
  var s = ['type', 'name', 'title', 'alt'];
  for (i = 0; i < s.length; i++)
    (r = s[i]), (a = e.getAttribute(r)) && o.push('['.concat(r, '="').concat(a, '"]'));
  return o.join('');
};

// 获取元素路径，最多保留5层
const getElmPath = function (e) {
  if (!e || 1 !== e.nodeType) return '';
  var ret = [],
    deepLength = 0, // 层数，最多5层
    elm = ''; // 元素
  if (e.innerText) {
    ret.push(`(${e.innerText.substr(0, 50)})`);
  }
  for (var t = e || null; t && deepLength++ < 5 && !('html' === (elm = normalTarget(t)));) {
    ret.push(elm), (t = t.parentNode);
  }
  return ret.reverse().join(' > ');
};

// 点击事件的监听
export function handleClick(event) {
  // 正在圈选
  if (GlobalVal.circle) {
    let target = event.target;
    let clsArray = target.className.split(/\s+/);
    let path = getElmPath(event.target);
    // clsArray 为 ['bombayjs-circle-active] 或 ['', 'bombayjs-circle-active]时
    if (clsArray.length === 1 || (clsArray.length === 2 && clsArray[0] === '')) {
      path = path.replace(/\.\.bombayjs-circle-active/, '');
    } else {
      path = path.replace(/\.bombayjs-circle-active/, '');
    }
    window.parent.postMessage(
      {
        t: 'setElmPath',
        path,
        page: GlobalVal.page,
      },
      '*'
    );
    event.stopPropagation();
    return;
  }
  var target;
  try {
    target = event.target;
  } catch (u) {
    target = '<unknown>';
  }
  if (target.nodeName === 'INPUT' || target.nodeName === 'TEXTAREA') return;

  if (0 !== target.length) {
    var behavior: eventBehavior = {
      type: 'ui.click',
      data: {
        path: getElmPath(target),
        pageX: event.pageX,
        pageY: event.pageY,
        message: '',
      },
    };
    // 空信息不上报
    const haveIgnoreEle = Config.ignore.ignoreBehaviorEles.some(ele =>
      behavior.data.path.includes(ele)
    );

    if (!behavior.data.path || haveIgnoreEle) return;
    let commonMsg = getCommonMsg();
    let msg: behaviorMsg = {
      ...commonMsg,
      ...{
        t: 'behavior',
        behavior,
      },
    };
    if (Config.reportUrlMultiple) {
      GlobalVal.reportCache.push(msg);
      localStorage.setItem('bombay-cache', JSON.stringify(GlobalVal.reportCache));
      if (GlobalVal.reportCache.length >= Config.maxCacheLength) {
        const reportCache = JSON.parse(JSON.stringify(GlobalVal.reportCache));
        report(reportCache);
        GlobalVal.reportCache = [];
        localStorage.removeItem('bombay-cache');
      }
    } else {
      report(msg);
    }
  }
}

// 监听输入框的失焦事件
export function handleBlur(event) {
  var target;
  try {
    target = event.target;
  } catch (u) {
    target = '<unknown>';
  }
  if (target.nodeName !== 'INPUT' && target.nodeName !== 'TEXTAREA') return;

  var behavior: eventBehavior = {
    type: 'ui.blur',
    data: {
      path: getElmPath(target),
      pageX: event.pageX,
      pageY: event.pageY,
      message: target.value,
    },
  };
  // 空信息不上报
  const haveIgnoreEle = Config.ignore.ignoreBehaviorEles.some(ele =>
    behavior.data.path.includes(ele)
  );

  if (!behavior.data.path || !behavior.data.message || haveIgnoreEle) return;
  let commonMsg = getCommonMsg();
  let msg: behaviorMsg = {
    ...commonMsg,
    ...{
      t: 'behavior',
      behavior,
    },
  };
  report(msg);
}

// 用户行为上报
export function handleBehavior(behavior: Behavior): void {
  let commonMsg = getCommonMsg();
  let msg: behaviorMsg = {
    ...commonMsg,
    ...{
      t: 'behavior',
      behavior,
    },
  };
  report(msg);
}

const TIMING_KEYS = [
  '',
  'fetchStart',
  'domainLookupStart',
  'domainLookupEnd',
  'connectStart',
  'connectEnd',
  'requestStart',
  'responseStart',
  'responseEnd',
  '',
  'domInteractive',
  '',
  'domContentLoadedEventEnd',
  'domComplete',
  'loadEventStart',
  '',
  'msFirstPaint',
  'secureConnectionStart',
];

// 处理性能
export function handlePerf(): void {
  const performance = window.performance;
  if (!performance || 'object' !== typeof performance) return;
  let data: any = {
    dns: 0, // DNS查询 domainLookupEnd - domainLookupStart
    tcp: 0, // TCP链接
    ssl: 0, // SSL建连
    ttfb: 0, // 请求响应
    trans: 0,
    dom: 0,
    res: 0,
    firstbyte: 0,
    fpt: 0,
    tti: 0,
    ready: 0,
    load: 0, // domready时间
  },
    timing = performance.timing || {},
    now = Date.now(),
    type = 1;
  let stateCheck = setInterval(() => {
    // @ts-ignore
    if (timing.loadEventEnd) {
      clearInterval(stateCheck);

      // 根据PerformanceNavigationTiming计算更准确
      // @ts-ignore
      if ('function' == typeof window.PerformanceNavigationTiming) {
        var c = performance.getEntriesByType('navigation')[0];
        c && ((timing = c), (type = 2));
      }

      // 计算data
      each(
        {
          dns: [3, 2],
          tcp: [5, 4],
          ssl: [5, 17],
          ttfb: [7, 6],
          trans: [8, 7],
          dom: [13, 10],
          res: [8, 6],
          firstbyte: [7, 2],
          fpt: [8, 1],
          tti: [10, 1],
          ready: [12, 1],
          load: [14, 1],
        },
        function (e, t) {
          var r = timing[TIMING_KEYS[e[1]]],
            o = timing[TIMING_KEYS[e[0]]];
          var c = Math.round(o - r);
          if (2 === type || (r !== undefined && o !== undefined)) {
            if (t === 'dom') {
              var c = Math.round(o - r);
            }
            c >= 0 && c < 36e5 && (data[t] = c);
          }
        }
      );

      var u =
        window.navigator.connection ||
        (window.navigator as any).mozConnection ||
        (window.navigator as any).webkitConnection,
        f = performance.navigation || { type: undefined };
      data.ct = u ? u.effectiveType || u.type : '';
      var l = u ? u.downlink || u.downlinkMax || u.bandwidth || null : null;
      if (
        ((l = l > 999 ? 999 : l) && (data.bandwidth = l),
          (data.navtype = 1 === f.type ? 'Reload' : 'Other'),
          1 === type && timing[TIMING_KEYS[16]] > 0 && timing[TIMING_KEYS[1]] > 0)
      ) {
        var h = timing[TIMING_KEYS[16]] - timing[TIMING_KEYS[1]];
        h >= 0 && h < 36e5 && (data.fpt = h);
      }
      1 === type && timing[TIMING_KEYS[1]] > 0
        ? (data.begin = timing[TIMING_KEYS[1]])
        : 2 === type && data.load > 0
          ? (data.begin = now - data.load)
          : (data.begin = now);
      let commonMsg = getCommonMsg();
      let msg: perfMsg = {
        ...commonMsg,
        t: 'perf',
        ...data,
        ...timing,
      };
      report(msg);
    }
  }, 50);
}

// 处理hash变化
// 注意在路由栈的路由不会触发
export function handleHashchange(e): void {
  let page = Config.enableSPA
    ? parseHash(location.hash.toLowerCase())
    : location.pathname.toLowerCase();
  page && setPage(page, false);
}

// 处理hash变化
export function handleHistorystatechange(e): void {
  let page = Config.enableSPA ? parseHash(e.detail.toLowerCase()) : e.detail.toLowerCase();
  page && setPage(page, false);
}

// 处理pv
export function handleNavigation(page): void {
  let commonMsg = getCommonMsg();
  let msg: behaviorMsg = {
    ...commonMsg,
    ...{
      t: 'behavior',
      behavior: {
        type: 'navigation',
        data: {
          from: commonMsg.page,
          to: page,
        },
      },
    },
  };
  report(msg);
}

// 设置页面，是否是第一次
export function setPage(page, isFirst?: boolean) {
  if (!isFirst && GlobalVal.page === page && GlobalVal.sBegin > Date.now() - 100) {
    return;
  }
  !isFirst && handleHealth();
  // FIXME: 这不需要 Navigation 
  // handleNavigation(page);

  if (isInIframe) {
    window.parent.postMessage(
      {
        t: 'setPage',
        href: location.href,
        page,
      },
      '*'
    );
  }
  setGlobalPage(page);
  setGlobalSid();
  handlePv();
}

// 页面的简况状态值的变化
export function handleHealth() {
  let healthy = GlobalVal._health.errcount ? 0 : 1;
  let commonMsg = getCommonMsg();
  let ret: healthMsg = {
    ...commonMsg,
    ...GlobalVal._health,
    ...{
      t: 'health',
      healthy, // 健康？ 0/1
      stay: Date.now() - GlobalVal.sBegin, // 停留时间
    },
  };
  resetGlobalHealth();
  report(ret);
}

// 处理Vue抛出的错误
export function handleVueErr(error, vm, info): void {
  let commonMsg = getCommonMsg();
  let msg: ErrorMsg = {
    ...commonMsg,
    ...{
      t: 'error',
      st: 'vue_error',
      msg: b64EncodeUnicode(error),
      file: '',
      // stack: 'Vue',
      // VM 太大了
      // vm: JSON.stringify(vm, replacerFunc()),
      // info: JSON.stringify(info, replacerFunc()),
      // 返回出错的 hook
      detail:JSON.stringify(info, replacerFunc()),
    },
  };
  report(msg);
}

// 处理错误
export function handleErr(error): void {
  if (Config.ignore.ignoreErrors.includes(error.type)) {
    return;
  }

  switch (error.type) {
    case 'error':
      error instanceof ErrorEvent ? reportCaughtError(error) : reportResourceError(error);
      break;
    case 'unhandledrejection':
      reportPromiseError(error);
      break;
  }
  setGlobalHealth('error');
}

// 捕获js异常
function reportCaughtError(error: any): void {
  let commonMsg = getCommonMsg();
  let n = error.name || 'CustomError',
    a = error.message || '',
    i = error.error.stack || '';
  let msg: ErrorMsg = {
    ...commonMsg,
    ...{
      t: 'error',
      st: 'caughterror',
      cate: n, // 类别
      // msg: a && a.substring(0, 1e3), // 信息
      // detail: i && i.substring(0, 1e3), // 错误栈
      msg: b64EncodeUnicode(a),
      detail: b64EncodeUnicode(i),
      // file: error.filename || '', // 出错文件
      file: b64EncodeUnicode(error.filename) || '',
      line: error.lineno || '', // 行
      col: error.colno || '', // 列
    },
  };
  report(msg);
}

// 捕获资源异常
function reportResourceError(error: any): void {
  let commonMsg = getCommonMsg();
  let target = error.target;
  if (Config.ignore.ignoreResources.some(api => target.src.includes(api))) {
    return;
  }
  let msg: ErrorMsg = {
    ...commonMsg,
    ...{
      t: 'error',
      st: 'resource',
      // msg: target.outerHTML,
      msg: encodeURIComponent(target.outerHTML),
      file: b64EncodeUnicode(encodeURIComponent(target.src)),
      stack: target.localName.toUpperCase(),
    },
  };
  report(msg);
}

// 捕获promise异常
function reportPromiseError(error: any): void {
  let commonMsg = getCommonMsg();
  let msg: ErrorMsg = {
    ...commonMsg,
    ...{
      t: 'error',
      st: 'promise',
      msg: b64EncodeUnicode(error.reason),
    },
  };
  report(msg);
}

// 处理资源的错误
export function handleResource() {
  var performance = window.performance;
  if (
    !performance ||
    'object' != typeof performance ||
    'function' != typeof performance.getEntriesByType
  )
    return null;
  let commonMsg = getCommonMsg();
  let msg: ResourceMsg = {
    ...commonMsg,
    ...{
      dom: 0,
      load: 0,
      t: 'res',
      res: [],
    },
  };
  var i = performance.timing || {},
    o = performance.getEntriesByType('resource') || [];
  // @ts-ignore
  if ('function' == typeof window.PerformanceNavigationTiming) {
    var s = performance.getEntriesByType('navigation')[0];
    s && (i = s);
  }
  each(
    {
      dom: [10, 8],
      load: [14, 1],
    },
    function (e, t) {
      var r = i[TIMING_KEYS[e[1]]],
        o = i[TIMING_KEYS[e[0]]];
      if (r !== undefined && o !== undefined) {
        var s = Math.round(o - r);
        s >= 0 && s < 36e5 && (msg[t] = s);
      }
    }
  );
  // 过滤忽略的url
  o = o.filter(item => {
    var include = findIndex(
      getConfig('ignore').ignoreApis,
      ignoreApi => item.name.indexOf(ignoreApi) > -1
    );
    return include > -1 ? false : true;
  });

  // 兼容Edge浏览器无法直接使用PerformanceResourceTiming对象类型的数据进行上报，处理方式是定义变量重新赋值
  if (checkEdge()) {
    var edgeResources = [];
    each(o, function (oItem) {
      edgeResources.push({
        connectEnd: oItem.connectEnd,
        connectStart: oItem.connectStart,
        domainLookupEnd: oItem.connectStart,
        domainLookupStart: oItem.domainLookupStart,
        duration: oItem.duration,
        entryType: oItem.entryType,
        fetchStart: oItem.fetchStart,
        initiatorType: oItem.initiatorType,
        name: oItem.name,
        redirectEnd: oItem.redirectEnd,
        redirectStart: oItem.redirectStart,
        responseEnd: oItem.responseEnd,
        responseStart: oItem.responseStart,
        startTime: oItem.startTime,
      });
    });
    o = edgeResources;
  }

  msg.res = o;
  report(msg);
}

// 监听接口的错误
export function handleApi(aurl, success, time, code, emsg, beigin) {
  if (!aurl) {
    warn('[retcode] api is null');
    return;
  }
  // 设置健康状态
  setGlobalHealth('api', success);
  
  // new 
  let msg = b64EncodeUnicode(emsg)
  let url = encodeURIComponent(aurl)

  let commonMsg = getCommonMsg();
  let apiMsg: ApiMsg = {
    ...commonMsg,
    ...{
      t: 'api',
      // beigin,
      url, // 接口
      success, // 成功？
      time, // 耗时
      code, // 接口返回的code
      msg, // 信息
    },
  };
  // 过滤忽略的url
  var include = findIndex(getConfig('ignore').ignoreApis, ignoreApi => url.indexOf(ignoreApi) > -1);
  if (include > -1) return;
  report(apiMsg);
}

// 统计总量,每次都要传数值过来
export function handleSum(key: string, val: number = 1) {
  let commonMsg = getCommonMsg();
  let g = splitGroup(key);
  let ret: sumMsg = {
    ...commonMsg,
    ...g,
    ...{
      t: 'sum',
      val,
    },
  };
  report(ret);
}

// 统计平均值
export function handleAvg(key: string, val: number = 1) {
  let commonMsg = getCommonMsg();
  let g = splitGroup(key);
  let ret: avgMsg = {
    ...commonMsg,
    ...g,
    ...{
      t: 'avg',
      val,
    },
  };
  report(ret);
}

// 上传记录消息
export function handleMsg(key: string) {
  let commonMsg = getCommonMsg();
  let g = splitGroup(key);
  let ret: msgMsg = {
    ...commonMsg,
    ...{
      t: 'msg',
      group: g.group,
      msg: b64EncodeUnicode(g.key.substr(0, Config.maxLength)),
    },
  };
  report(ret);
}

// hover事件
export function handleHover(e) {
  var cls = document.getElementsByClassName(CIRCLECLS);
  if (cls.length > 0) {
    for (var i = 0; i < cls.length; i++) {
      cls[i].className = cls[i].className.replace(/ bombayjs-circle-active/g, '');
    }
  }
  e.target.className += ` ${CIRCLECLS}`;
}

// 注入css
export function insertCss() {
  var content = `.${CIRCLECLS}{border: #ff0000 2px solid;}`;
  var style = document.createElement('style');
  style.type = 'text/css';
  style.id = CIRCLESTYLEID;
  try {
    style.appendChild(document.createTextNode(content));
  } catch (ex) {
    style.styleSheet.cssText = content; //针对IE
  }
  var head = document.getElementsByTagName('head')[0];
  head.appendChild(style);
}

// 移除css
export function removeCss() {
  var style = document.getElementById(CIRCLESTYLEID);
  style.parentNode.removeChild(style);
}

// 监听圈选
export function listenCircleListener() {
  insertCss();
  GlobalVal.cssInserted = true;
  GlobalVal.circle = true;
  on('mouseover', handleHover);
}

// 移除圈选
export function removeCircleListener() {
  removeCss();
  GlobalVal.cssInserted = false;
  GlobalVal.circle = false;
  off('mouseover', handleHover);
}

export function listenMessageListener() {
  on('message', handleMessage);
}

/**
 *  监听iframe中的postmessage事件
 * @param {*} event {t: '', v: ''}
 *  t: type
 *  v: value
 */
function handleMessage(event) {
  // 防止其他message的干扰
  if (!event.data || !event.data.t) return;
  if (event.data.t === 'setCircle') {
    if (Boolean(event.data.v)) {
      listenCircleListener();
    } else {
      removeCircleListener();
    }
  } else if (event.data.t === 'back') {
    window.history.back();
  } else if (event.data.t === 'forward') {
    window.history.forward();
  }
}

// 监听用户的时长
// 用户在线时长统计
export function handleStayTime() {
  const SEND_MILL = Config.sendMill;
  const now = Date.now();
  const duration = now - GlobalVal.lastTime;

  if (duration > Config.offlineTime) {
    GlobalVal.lastTime = Date.now();
  } else if (duration > SEND_MILL) {
    GlobalVal.lastTime = Date.now();
    let commonMsg = getCommonMsg();
    let msg: durationMsg = {
      ...commonMsg,
      ...{
        t: 'duration',
        duration_ms: duration,
      },
    };
    report(msg);
  }
}

// 用户自定义上传事件
export function handleCustomizeReport(customizeMessage) {
  if (!customizeMessage.t) {
    throw Error('行为类型不能为空');
  }
  let commonMsg = getCommonMsg();
  let msg = {
    ...commonMsg,
    ...customizeMessage,
  };
  report(msg);
}
