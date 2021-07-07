/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
}

// 默认参数
let Config = {
    // 上报地址
    reportUrl: 'http://localhost:7002',
    // 批量上报地址 当配置了这个字段的时候，会将用户行为集成加载
    reportUrlMultiple: '',
    // 最长缓存长度
    maxCacheLength: 20,
    // 是否为 post 的方式进行上报 默认是 true  当是 false 的时候通过 new Image() 方法上报,兼容好点,但会丢失用户行为数据
    isPost: false,
    // 提交参数
    token: '',
    // app版本
    appVersion: '1.0.0',
    // 环境 dev or prod
    environment: 'prod',
    // 脚本延迟上报时间
    outtime: 300,
    // 开启单页面？
    enableSPA: true,
    // 是否自动上报pv
    autoSendPv: true,
    // 是否上报页面性能数据 perf
    isPage: true,
    // 是否上报ajax性能数据 及监听
    isAjax: false,
    // 是否上报页面资源数据
    isResource: false,
    // 是否上报错误信息
    isError: true,
    // NOTE: 是否录屏 功能暂未开发后续 可通过插件的形式 实现
    isRecord: false,
    // 是否记录停留时长
    isCountStayTime: true,
    // 是否上报行为 如果是行为上报则需要通过 post 的方式 上报
    isBehavior: false,
    ignore: {
        ignoreErrors: [],
        ignoreUrls: [],
        ignorePvs: ['404'],
        ignoreResources: [],
        ignoreApis: ['/api/v1/report/web', 'livereload.js?snipver=1', '/sockjs-node/info'],
        ignoreBehaviorEles: [],
    },
    behavior: {
        console: ['debug', 'error'],
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
};
// 设置参数
function setConfig(options) {
    const ignore = Object.assign(Object.assign({}, Config.ignore), options.ignore);
    Config = Object.assign(Object.assign(Object.assign({}, Config), options), { ignore });
}
function getConfig(e) {
    return e ? (Config[e] ? Config[e] : {}) : {};
}

const noop = function () { };
function randomString() {
    for (var e, t, n = 20, r = new Array(n), a = Date.now().toString(36).split(""); n-- > 0;)
        t = (e = 36 * Math.random() | 0).toString(36), r[n] = e % 3 ? t : t.toUpperCase();
    for (var i = 0; i < 8; i++)
        r.splice(3 * i + 2, 0, a[i]);
    return r.join("");
}
// 将{ method: 'get', state: '200' }转为?method=get&state=200
function serialize(obj) {
    var str = [];
    for (var p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return str.join("&");
}
function each(data, fn) {
    var n = 0, r = data.length;
    if (isTypeOf(data, 'Array'))
        for (; n < r && !1 !== fn.call(data[n], data[n], n); n++)
            ;
    else
        for (var m in data)
            if (!1 === fn.call(data[m], data[m], m))
                break;
    return data;
}
/**
 * 是否是某类型
 *
 * @export
 * @param {*} data
 * @param {*} type
 * @returns 有type就返回true/false,没有就返回对于类型
 */
function isTypeOf(data, type) {
    var n = Object.prototype.toString.call(data).substring(8).replace("]", "");
    return type ? n === type : n;
}
const on = function (event, fn, remove) {
    window.addEventListener ? window.addEventListener(event, function a(i) {
        remove && window.removeEventListener(event, a, true), fn.call(this, i);
    }, true) : window.attachEvent && window.attachEvent("on" + event, function i(a) {
        remove && window.detachEvent("on" + event, i), fn.call(this, a);
    });
};
const off = function (event, fn) {
    return fn ? (window.removeEventListener ? window.removeEventListener(event, fn) : window.detachEvent &&
        window.detachEvent(event, fn), this) : this;
};
const parseHash = function (e) {
    return (e ? parseUrl(e.replace(/^#\/?/, "")) : "") || "[index]";
};
const parseUrl = function (e) {
    return e && "string" == typeof e ? e.replace(/^(https?:)?\/\//, "").replace(/\?.*$/, "") : "";
};
// 函数toString方法
const fnToString = function (e) {
    return function () {
        return e + "() { [native code] }";
    };
};
const warn = function () {
    var e = "object" == typeof console ? console.warn : noop;
    try {
        var t = {
            warn: e
        };
        t.warn.call(t);
    }
    catch (n) {
        return noop;
    }
    return e;
}();
// 自定义事件，并dispatch
const dispatchCustomEvent = function (e, t) {
    var r;
    window.CustomEvent
        ? r = new CustomEvent(e, {
            detail: t
        })
        : ((r = window.document.createEvent("HTMLEvents")).initEvent(e, !1, !0), r.detail = t);
    window.dispatchEvent(r);
};
// group::key
const splitGroup = function (e) {
    var n = e.split("::");
    return n.length > 1 ? {
        group: n[0],
        key: n[1]
    } : {
        group: "default_group",
        key: n[0]
    };
};
// HACK: 在IE浏览器及猎豹浏览器中，对象不支持findIndex的问题
const findIndex = function (arr, fn) {
    return arr.reduce(function (carry, item, idx) {
        if (fn(item, idx)) {
            return idx;
        }
        return carry;
    }, -1);
};
// 检查是否是Edge浏览器
const checkEdge = function () {
    var isEdge = navigator.userAgent.indexOf("Edge") > -1;
    return isEdge;
};
const isInIframe = self != top;
/**
 * fix: TypeError: Converting circular structure to JSON
 * 修复一些循环依赖的问题.
 */
const replacerFunc = () => {
    const visited = new WeakSet();
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (visited.has(value)) {
                return;
            }
            visited.add(value);
        }
        return value;
    };
};

const cache = localStorage.getItem('bombay-cache')
    ? JSON.parse(localStorage.getItem('bombay-cache'))
    : [];
// 默认参数
let GlobalVal = {
    lastTime: Date.now(),
    page: '',
    sid: '',
    sBegin: Date.now(),
    _health: {
        errcount: 0,
        apisucc: 0,
        apifail: 0,
    },
    circle: false,
    reportCache: cache,
    cssInserted: false,
};
function setGlobalPage(page) {
    GlobalVal.page = page;
}
function setGlobalSid() {
    GlobalVal.sid = randomString();
    GlobalVal.sBegin = Date.now();
}
function setGlobalHealth(type, success) {
    if (type === 'error')
        GlobalVal._health.errcount++;
    if (type === 'api' && success)
        GlobalVal._health.apisucc++;
    if (type === 'api' && !success)
        GlobalVal._health.apifail++;
}
function resetGlobalHealth() {
    GlobalVal._health = {
        errcount: 0,
        apisucc: 0,
        apifail: 0,
    };
}

var version = "2.1.4";

/// <reference path='../typings/index.d.ts' />
// 获取公共的上传参数
function getCommonMsg() {
    // const device = getDeviceString();
    // const deviceInfo = getDeviceInfo();
    // 2020-12-21 17:33:32
    const tempinfo = getDeviceInfo2();
    const device = tempinfo.deviceModel + "|" + tempinfo.deviceOs + "|" + tempinfo.wechat;
    let u = navigator.connection;
    let data = {
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
    };
    return data;
}
function getHash() {
    return location.hash;
}
// 使用库 太大了
// function getDeviceInfo(): any {
//   return new UA(window.navigator.userAgent) || {};
// }
// 获取页面
function getPage() {
    if (GlobalVal.page)
        return GlobalVal.page;
    else {
        return location.pathname.toLowerCase();
    }
}
// 获取uid
function getUid() {
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
    var lang = navigator.language || navigator.userLanguage; //常规浏览器语言和IE浏览器
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
function getDeviceInfo2() {
    let userAgent = navigator.userAgent;
    let weblog = {};
    let isModel;
    // 微信判断
    let m1 = userAgent.match(/MicroMessenger.*?(?= )/);
    if (m1 && m1.length > 0) {
        weblog.wechat = m1[0];
    }
    // 苹果手机
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        // 获取设备名
        if (userAgent.includes('iPad')) {
            weblog.deviceModel = 'iPad';
        }
        else {
            weblog.deviceModel = 'iPhone';
        }
        // 获取操作系统版本
        m1 = userAgent.match(/iPhone OS .*?(?= )/);
        if (m1 && m1.length > 0) {
            weblog.deviceOs = m1[0];
        }
        isModel = "ios";
    }
    // 安卓手机
    if (userAgent.includes('Android')) {
        // 获取设备名
        m1 = userAgent.match(/Android.*; ?(.*(?= Build))/);
        if (m1 && m1.length > 1) {
            weblog.deviceModel = m1[1];
        }
        // 获取操作系统版本
        m1 = userAgent.match(/Android.*?(?=;)/);
        if (m1 && m1.length > 0) {
            weblog.deviceOs = m1[0];
        }
        isModel = "Android";
    }
    // PC端 简单化处理
    if (!isModel) {
        weblog.deviceModel = "pc";
        weblog.deviceOs = "pc";
        weblog.wechat = "other";
    }
    return weblog;
}
// TODO: parse mail
// Encoding UTF8 ⇢ base64
function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode(parseInt(p1, 16));
    }));
}
// b64EncodeUnicode('✓ à la mode') // "4pyTIMOgIGxhIG1vZGU="
// b64EncodeUnicode('\n') // "Cg=="
// Decoding base64 ⇢ UTF8
// function b64DecodeUnicode(str) {
//     return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
//         return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
//     }).join(''))
// }

/// <reference path='typings/index.d.ts' />
// 上报
function report(e) {
    if (Array.isArray(e)) {
        send(e);
    }
    else {
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
function send(msg) {
    if (Array.isArray(msg)) {
        post(Config.reportUrlMultiple, {
            behaviorList: msg,
        });
    }
    else {
        if (Config.isPost) {
            var body = msg[msg.t];
            delete msg[msg.t];
            var url = `${Config.reportUrl}?${serialize(msg)}`;
            post(url, {
                [msg.t]: body,
            });
        }
        else {
            // 会丢弃 res | behavior ,类型的部分参数
            new Image().src = `${Config.reportUrl}?${serialize(msg)}`;
        }
    }
}
function post(url, body) {
    var XMLHttpRequest = window.__oXMLHttpRequest_ || window.XMLHttpRequest;
    if (typeof XMLHttpRequest === 'function') {
        try {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', url, !0);
            xhr.setRequestHeader('Content-Type', 'text/plain');
            xhr.send(JSON.stringify(body));
        }
        catch (e) {
            warn('[tracer.js] Failed to log, POST请求失败');
        }
    }
    else {
        warn('[tracer.js] Failed to log, 浏览器不支持XMLHttpRequest');
    }
}
// 健康检查上报
function sendBeacon(e) {
    'object' == typeof e && (e = serialize(e));
    e = `${Config.reportUrl}?${e}`;
    window && window.navigator && 'function' == typeof window.navigator.sendBeacon
        ? window.navigator.sendBeacon(e)
        : warn('[arms] navigator.sendBeacon not surported');
}

/// <reference path='typings/index.d.ts' />
const CIRCLECLS = 'bombayjs-circle-active'; // circle class类名
const CIRCLESTYLEID = 'bombayjs-circle-css'; // 插入的style标签id
// 处理pv
function handlePv() {
    if (!Config.autoSendPv)
        return;
    let commonMsg = getCommonMsg();
    if (Config.ignore.ignorePvs.includes(commonMsg.page)) {
        return;
    }
    let msg = Object.assign(Object.assign({}, commonMsg), {
        t: 'pv',
        dt: document.title,
        dl: encodeURIComponent(location.href),
        // dr: document.referrer,
        dr: encodeURIComponent(document.referrer),
        dpr: window.devicePixelRatio,
        de: document.charset,
    });
    report(msg);
}
// 处理html node
const normalTarget = function (e) {
    var t, n, r, a, i, o = [];
    if (!e || !e.tagName)
        return '';
    if ((o.push(e.tagName.toLowerCase()),
        e.id && o.push('#'.concat(e.id)),
        (t = e.className) && '[object String]' === Object.prototype.toString.call(t))) {
        for (n = t.split(/\s+/), i = 0; i < n.length; i++) {
            // className包含active的不加入路径
            if (n[i].indexOf('active') < 0)
                o.push('.'.concat(n[i]));
        }
    }
    var s = ['type', 'name', 'title', 'alt'];
    for (i = 0; i < s.length; i++)
        (r = s[i]), (a = e.getAttribute(r)) && o.push('['.concat(r, '="').concat(a, '"]'));
    return o.join('');
};
// 获取元素路径，最多保留5层
const getElmPath = function (e) {
    if (!e || 1 !== e.nodeType)
        return '';
    var ret = [], deepLength = 0, // 层数，最多5层
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
function handleClick(event) {
    // 正在圈选
    if (GlobalVal.circle) {
        let target = event.target;
        let clsArray = target.className.split(/\s+/);
        let path = getElmPath(event.target);
        // clsArray 为 ['bombayjs-circle-active] 或 ['', 'bombayjs-circle-active]时
        if (clsArray.length === 1 || (clsArray.length === 2 && clsArray[0] === '')) {
            path = path.replace(/\.\.bombayjs-circle-active/, '');
        }
        else {
            path = path.replace(/\.bombayjs-circle-active/, '');
        }
        window.parent.postMessage({
            t: 'setElmPath',
            path,
            page: GlobalVal.page,
        }, '*');
        event.stopPropagation();
        return;
    }
    var target;
    try {
        target = event.target;
    }
    catch (u) {
        target = '<unknown>';
    }
    if (target.nodeName === 'INPUT' || target.nodeName === 'TEXTAREA')
        return;
    if (0 !== target.length) {
        var behavior = {
            type: 'ui.click',
            data: {
                path: getElmPath(target),
                pageX: event.pageX,
                pageY: event.pageY,
                message: '',
            },
        };
        // 空信息不上报
        const haveIgnoreEle = Config.ignore.ignoreBehaviorEles.some(ele => behavior.data.path.includes(ele));
        if (!behavior.data.path || haveIgnoreEle)
            return;
        let commonMsg = getCommonMsg();
        let msg = Object.assign(Object.assign({}, commonMsg), {
            t: 'behavior',
            behavior,
        });
        if (Config.reportUrlMultiple) {
            GlobalVal.reportCache.push(msg);
            localStorage.setItem('bombay-cache', JSON.stringify(GlobalVal.reportCache));
            if (GlobalVal.reportCache.length >= Config.maxCacheLength) {
                const reportCache = JSON.parse(JSON.stringify(GlobalVal.reportCache));
                report(reportCache);
                GlobalVal.reportCache = [];
                localStorage.removeItem('bombay-cache');
            }
        }
        else {
            report(msg);
        }
    }
}
// 监听输入框的失焦事件
function handleBlur(event) {
    var target;
    try {
        target = event.target;
    }
    catch (u) {
        target = '<unknown>';
    }
    if (target.nodeName !== 'INPUT' && target.nodeName !== 'TEXTAREA')
        return;
    var behavior = {
        type: 'ui.blur',
        data: {
            path: getElmPath(target),
            pageX: event.pageX,
            pageY: event.pageY,
            message: target.value,
        },
    };
    // 空信息不上报
    const haveIgnoreEle = Config.ignore.ignoreBehaviorEles.some(ele => behavior.data.path.includes(ele));
    if (!behavior.data.path || !behavior.data.message || haveIgnoreEle)
        return;
    let commonMsg = getCommonMsg();
    let msg = Object.assign(Object.assign({}, commonMsg), {
        t: 'behavior',
        behavior,
    });
    report(msg);
}
// 用户行为上报
function handleBehavior(behavior) {
    let commonMsg = getCommonMsg();
    let msg = Object.assign(Object.assign({}, commonMsg), {
        t: 'behavior',
        behavior,
    });
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
    '',
    'loadEventStart',
    '',
    'msFirstPaint',
    'secureConnectionStart',
];
// 处理性能
function handlePerf() {
    const performance = window.performance;
    if (!performance || 'object' !== typeof performance)
        return;
    let data = {
        dns: 0,
        tcp: 0,
        ssl: 0,
        ttfb: 0,
        trans: 0,
        dom: 0,
        res: 0,
        firstbyte: 0,
        fpt: 0,
        tti: 0,
        ready: 0,
        load: 0,
    }, timing = performance.timing || {}, now = Date.now(), type = 1;
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
            each({
                dns: [3, 2],
                tcp: [5, 4],
                ssl: [5, 17],
                ttfb: [7, 6],
                trans: [8, 7],
                dom: [10, 8],
                res: [14, 12],
                firstbyte: [7, 2],
                fpt: [8, 1],
                tti: [10, 1],
                ready: [12, 1],
                load: [14, 1],
            }, function (e, t) {
                var r = timing[TIMING_KEYS[e[1]]], o = timing[TIMING_KEYS[e[0]]];
                var c = Math.round(o - r);
                if (2 === type || (r !== undefined && o !== undefined)) {
                    if (t === 'dom') {
                        var c = Math.round(o - r);
                    }
                    c >= 0 && c < 36e5 && (data[t] = c);
                }
            });
            var u = window.navigator.connection ||
                window.navigator.mozConnection ||
                window.navigator.webkitConnection, f = performance.navigation || { type: undefined };
            data.ct = u ? u.effectiveType || u.type : '';
            var l = u ? u.downlink || u.downlinkMax || u.bandwidth || null : null;
            if (((l = l > 999 ? 999 : l) && (data.bandwidth = l),
                (data.navtype = 1 === f.type ? 'Reload' : 'Other'),
                1 === type && timing[TIMING_KEYS[16]] > 0 && timing[TIMING_KEYS[1]] > 0)) {
                var h = timing[TIMING_KEYS[16]] - timing[TIMING_KEYS[1]];
                h >= 0 && h < 36e5 && (data.fpt = h);
            }
            1 === type && timing[TIMING_KEYS[1]] > 0
                ? (data.begin = timing[TIMING_KEYS[1]])
                : 2 === type && data.load > 0
                    ? (data.begin = now - data.load)
                    : (data.begin = now);
            let commonMsg = getCommonMsg();
            let msg = Object.assign(Object.assign(Object.assign(Object.assign({}, commonMsg), { t: 'perf' }), data), timing);
            report(msg);
        }
    }, 50);
}
// 处理hash变化
// 注意在路由栈的路由不会触发
function handleHashchange(e) {
    let page = Config.enableSPA
        ? parseHash(location.hash.toLowerCase())
        : location.pathname.toLowerCase();
    page && setPage(page, false);
}
// 处理hash变化
function handleHistorystatechange(e) {
    let page = Config.enableSPA ? parseHash(e.detail.toLowerCase()) : e.detail.toLowerCase();
    page && setPage(page, false);
}
// 设置页面，是否是第一次
function setPage(page, isFirst) {
    if (!isFirst && GlobalVal.page === page && GlobalVal.sBegin > Date.now() - 100) {
        return;
    }
    !isFirst && handleHealth();
    // FIXME: 这不需要 Navigation 
    // handleNavigation(page);
    if (isInIframe) {
        window.parent.postMessage({
            t: 'setPage',
            href: location.href,
            page,
        }, '*');
    }
    setGlobalPage(page);
    setGlobalSid();
    handlePv();
}
// 页面的简况状态值的变化
function handleHealth() {
    let healthy = GlobalVal._health.errcount ? 0 : 1;
    let commonMsg = getCommonMsg();
    let ret = Object.assign(Object.assign(Object.assign({}, commonMsg), GlobalVal._health), {
        t: 'health',
        healthy,
        stay: Date.now() - GlobalVal.sBegin,
    });
    resetGlobalHealth();
    report(ret);
}
// 处理Vue抛出的错误
function handleVueErr(error, vm, info) {
    let commonMsg = getCommonMsg();
    let msg = Object.assign(Object.assign({}, commonMsg), {
        t: 'error',
        st: 'vue_error',
        msg: b64EncodeUnicode(error),
        file: '',
        // stack: 'Vue',
        // VM 太大了
        // vm: JSON.stringify(vm, replacerFunc()),
        // info: JSON.stringify(info, replacerFunc()),
        // 返回出错的 hook
        detail: JSON.stringify(info, replacerFunc()),
    });
    report(msg);
}
// 处理错误
function handleErr(error) {
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
function reportCaughtError(error) {
    let commonMsg = getCommonMsg();
    let n = error.name || 'CustomError', a = error.message || '', i = error.error.stack || '';
    let msg = Object.assign(Object.assign({}, commonMsg), {
        t: 'error',
        st: 'caughterror',
        cate: n,
        // msg: a && a.substring(0, 1e3), // 信息
        // detail: i && i.substring(0, 1e3), // 错误栈
        msg: b64EncodeUnicode(a),
        detail: b64EncodeUnicode(i),
        // file: error.filename || '', // 出错文件
        file: b64EncodeUnicode(error.filename) || '',
        line: error.lineno || '',
        col: error.colno || '',
    });
    report(msg);
}
// 捕获资源异常
function reportResourceError(error) {
    let commonMsg = getCommonMsg();
    let target = error.target;
    if (Config.ignore.ignoreResources.some(api => target.src.includes(api))) {
        return;
    }
    let msg = Object.assign(Object.assign({}, commonMsg), {
        t: 'error',
        st: 'resource',
        // msg: target.outerHTML,
        msg: encodeURIComponent(target.outerHTML),
        file: b64EncodeUnicode(encodeURIComponent(target.src)),
        stack: target.localName.toUpperCase(),
    });
    report(msg);
}
// 捕获promise异常
function reportPromiseError(error) {
    let commonMsg = getCommonMsg();
    let msg = Object.assign(Object.assign({}, commonMsg), {
        t: 'error',
        st: 'promise',
        msg: b64EncodeUnicode(error.reason),
    });
    report(msg);
}
// 处理资源的错误
function handleResource() {
    var performance = window.performance;
    if (!performance ||
        'object' != typeof performance ||
        'function' != typeof performance.getEntriesByType)
        return null;
    let commonMsg = getCommonMsg();
    let msg = Object.assign(Object.assign({}, commonMsg), {
        dom: 0,
        load: 0,
        t: 'res',
        res: [],
    });
    var i = performance.timing || {}, o = performance.getEntriesByType('resource') || [];
    // @ts-ignore
    if ('function' == typeof window.PerformanceNavigationTiming) {
        var s = performance.getEntriesByType('navigation')[0];
        s && (i = s);
    }
    each({
        dom: [10, 8],
        load: [14, 1],
    }, function (e, t) {
        var r = i[TIMING_KEYS[e[1]]], o = i[TIMING_KEYS[e[0]]];
        if (r !== undefined && o !== undefined) {
            var s = Math.round(o - r);
            s >= 0 && s < 36e5 && (msg[t] = s);
        }
    });
    // 过滤忽略的url
    o = o.filter(item => {
        var include = findIndex(getConfig('ignore').ignoreApis, ignoreApi => item.name.indexOf(ignoreApi) > -1);
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
function handleApi(aurl, success, time, code, emsg, beigin) {
    if (!aurl) {
        warn('[retcode] api is null');
        return;
    }
    // 设置健康状态
    setGlobalHealth('api', success);
    // new 
    let msg = b64EncodeUnicode(emsg);
    let url = encodeURIComponent(aurl);
    let commonMsg = getCommonMsg();
    let apiMsg = Object.assign(Object.assign({}, commonMsg), {
        t: 'api',
        // beigin,
        url,
        success,
        time,
        code,
        msg,
    });
    // 过滤忽略的url
    var include = findIndex(getConfig('ignore').ignoreApis, ignoreApi => url.indexOf(ignoreApi) > -1);
    if (include > -1)
        return;
    report(apiMsg);
}
// 统计总量,每次都要传数值过来
function handleSum(key, val = 1) {
    let commonMsg = getCommonMsg();
    let g = splitGroup(key);
    let ret = Object.assign(Object.assign(Object.assign({}, commonMsg), g), {
        t: 'sum',
        val,
    });
    report(ret);
}
// 统计平均值
function handleAvg(key, val = 1) {
    let commonMsg = getCommonMsg();
    let g = splitGroup(key);
    let ret = Object.assign(Object.assign(Object.assign({}, commonMsg), g), {
        t: 'avg',
        val,
    });
    report(ret);
}
// 上传记录消息
function handleMsg(key) {
    let commonMsg = getCommonMsg();
    let g = splitGroup(key);
    let ret = Object.assign(Object.assign({}, commonMsg), {
        t: 'msg',
        group: g.group,
        msg: b64EncodeUnicode(g.key.substr(0, Config.maxLength)),
    });
    report(ret);
}
// hover事件
function handleHover(e) {
    var cls = document.getElementsByClassName(CIRCLECLS);
    if (cls.length > 0) {
        for (var i = 0; i < cls.length; i++) {
            cls[i].className = cls[i].className.replace(/ bombayjs-circle-active/g, '');
        }
    }
    e.target.className += ` ${CIRCLECLS}`;
}
// 注入css
function insertCss() {
    var content = `.${CIRCLECLS}{border: #ff0000 2px solid;}`;
    var style = document.createElement('style');
    style.type = 'text/css';
    style.id = CIRCLESTYLEID;
    try {
        style.appendChild(document.createTextNode(content));
    }
    catch (ex) {
        style.styleSheet.cssText = content; //针对IE
    }
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(style);
}
// 移除css
function removeCss() {
    var style = document.getElementById(CIRCLESTYLEID);
    style.parentNode.removeChild(style);
}
// 监听圈选
function listenCircleListener() {
    insertCss();
    GlobalVal.cssInserted = true;
    GlobalVal.circle = true;
    on('mouseover', handleHover);
}
// 移除圈选
function removeCircleListener() {
    removeCss();
    GlobalVal.cssInserted = false;
    GlobalVal.circle = false;
    off('mouseover', handleHover);
}
function listenMessageListener() {
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
    if (!event.data || !event.data.t)
        return;
    if (event.data.t === 'setCircle') {
        if (Boolean(event.data.v)) {
            listenCircleListener();
        }
        else {
            removeCircleListener();
        }
    }
    else if (event.data.t === 'back') {
        window.history.back();
    }
    else if (event.data.t === 'forward') {
        window.history.forward();
    }
}
// 监听用户的时长
// 用户在线时长统计
function handleStayTime() {
    const SEND_MILL = Config.sendMill;
    const now = Date.now();
    const duration = now - GlobalVal.lastTime;
    if (duration > Config.offlineTime) {
        GlobalVal.lastTime = Date.now();
    }
    else if (duration > SEND_MILL) {
        GlobalVal.lastTime = Date.now();
        let commonMsg = getCommonMsg();
        let msg = Object.assign(Object.assign({}, commonMsg), {
            t: 'duration',
            duration_ms: duration,
        });
        report(msg);
    }
}
// 用户自定义上传事件
function handleCustomizeReport(customizeMessage) {
    if (!customizeMessage.t) {
        throw Error('行为类型不能为空');
    }
    let commonMsg = getCommonMsg();
    let msg = Object.assign(Object.assign({}, commonMsg), customizeMessage);
    report(msg);
}

/// <reference path='typings/index.d.ts' />
// 劫持console方法
// "debug", "info", "warn", "log", "error"
function hackConsole() {
    if (window && window.console) {
        for (var e = Config.behavior.console, n = 0; e.length; n++) {
            var r = e[n];
            var action = window.console[r];
            if (!window.console[r])
                return;
            (function (r, action) {
                window.console[r] = function () {
                    var i = Array.prototype.slice.apply(arguments);
                    var s = {
                        type: 'console',
                        data: {
                            level: r,
                            message: JSON.stringify(i, replacerFunc()),
                        },
                    };
                    handleBehavior(s);
                    action && action.apply(null, i);
                };
            })(r, action);
        }
    }
}
/**
 * hack pushstate replaceState
 * 派送historystatechange historystatechange事件
 * @export
 * @param {('pushState' | 'replaceState')} e
 */
function hackState(e) {
    var t = history[e];
    'function' == typeof t &&
        ((history[e] = function (n, i, s) {
            !window['__bb_onpopstate_'] && hackOnpopstate(); // 调用pushState或replaceState时hack Onpopstate
            var c = 1 === arguments.length ? [arguments[0]] : Array.apply(null, arguments), u = location.href, f = t.apply(history, c);
            if (!s || 'string' != typeof s)
                return f;
            if (s === u)
                return f;
            try {
                var l = u.split('#'), h = s.split('#'), p = parseUrl(l[0]), d = parseUrl(h[0]), g = l[1] && l[1].replace(/^\/?(.*)/, '$1'), v = h[1] && h[1].replace(/^\/?(.*)/, '$1');
                p !== d
                    ? dispatchCustomEvent('historystatechanged', d)
                    : g !== v && dispatchCustomEvent('historystatechanged', v);
            }
            catch (m) {
                warn('[retcode] error in ' + e + ': ' + m);
            }
            return f;
        }),
            (history[e].toString = fnToString(e)));
}
function hackhook() {
    hackFetch();
    hackAjax();
}
// 劫持fetch网络请求 会被截断，最长1000个字符
function hackFetch() {
    if ('function' == typeof window.fetch) {
        var __oFetch_ = window.fetch;
        window['__oFetch_'] = __oFetch_;
        window.fetch = function (t, o) {
            var a = 1 === arguments.length ? [arguments[0]] : Array.apply(null, arguments);
            var begin = Date.now(), url = (t && 'string' != typeof t ? t.url : t) || '', page = parseUrl(url);
            if (!page)
                return __oFetch_.apply(window, a);
            return __oFetch_.apply(window, a).then(function (e) {
                var response = e.clone(), headers = response.headers;
                if (headers && 'function' === typeof headers.get) {
                    var ct = headers.get('content-type');
                    if (ct && !/(text)|(json)/.test(ct))
                        return e;
                }
                var time = Date.now() - begin;
                response.text().then(function (res) {
                    if (response.ok) {
                        handleApi(page, !0, time, status, res.substr(0, Config.maxLength) || '');
                    }
                    else {
                        handleApi(page, !1, time, status, res.substr(0, Config.maxLength) || '');
                    }
                });
                return e;
            });
        };
    }
}
// 如果返回过长，会被截断，最长1000个字符
function hackAjax() {
    if ('function' == typeof window.XMLHttpRequest) {
        var begin = 0, page = '';
        var __oXMLHttpRequest_ = window.XMLHttpRequest;
        window['__oXMLHttpRequest_'] = __oXMLHttpRequest_;
        window.XMLHttpRequest = function (t) {
            var xhr = new __oXMLHttpRequest_(t);
            if (!xhr.addEventListener)
                return xhr;
            var open = xhr.open, send = xhr.send;
            xhr.open = function (method, url) {
                var a = 1 === arguments.length ? [arguments[0]] : Array.apply(null, arguments);
                url = url;
                page = parseUrl(url);
                open.apply(xhr, a);
            };
            xhr.send = function () {
                begin = Date.now();
                var a = 1 === arguments.length ? [arguments[0]] : Array.apply(null, arguments);
                send.apply(xhr, a);
            };
            xhr.onreadystatechange = function () {
                if (page && 4 === xhr.readyState) {
                    var time = Date.now() - begin;
                    if (xhr.status >= 200 && xhr.status <= 299) {
                        var status = xhr.status || 200;
                        if ('function' == typeof xhr.getResponseHeader) {
                            var r = xhr.getResponseHeader('Content-Type');
                            if (r && !/(text)|(json)/.test(r))
                                return;
                        }
                        handleApi(page, !0, time, status, xhr.responseText.substr(0, Config.maxLength) || '');
                    }
                    else {
                        var status = xhr.status || 'FAILED';
                        handleApi(page, !1, time, status, xhr.responseText.substr(0, Config.maxLength) || '');
                    }
                }
            };
            return xhr;
        };
    }
}
// 监听history的栈的改变
function hackOnpopstate() {
    window['__bb_onpopstate_'] = window.onpopstate;
    window.addEventListener('popstate', function () {
        // for (var r = arguments.length, a = new Array(r), o = 0; o < r; o++) a[o] = arguments[o];
        let page = Config.enableSPA
            ? parseHash(location.hash.toLowerCase())
            : location.pathname.toLowerCase();
        setPage(page, false);
        // if (window.__bb_onpopstate_) return window.__bb_onpopstate_.apply(this, a)
    });
}

class Tracer {
    constructor(options, fn) {
        this.init(options);
    }
    init(_a) {
        var { Vue } = _a, options = __rest(_a, ["Vue"]);
        // 没有token,则不监听任何事件
        if (options && !options.token) {
            throw Error('请输入一个token');
        }
        // 监听Vue的错误
        Vue && this.addListenVueError(Vue);
        setConfig(options);
        let page = Config.enableSPA
            ? parseHash(location.hash.toLowerCase())
            : location.pathname.toLowerCase();
        setPage(page, true);
        Config.isPage && this.sendPerf();
        Config.enableSPA && this.addListenRouterChange();
        Config.isError && this.addListenJs();
        Config.isAjax && this.addListenAjax();
        Config.isRecord && this.addRrweb();
        // 行为是一个页面内的操作
        Config.isBehavior && this.addListenBehavior();
        Config.isResource && this.sendResource();
        // 绑定全局变量
        window.__bb = this;
        this.addListenUnload();
        // 监听message
        listenMessageListener();
        if (GlobalVal.circle) {
            listenCircleListener();
        }
    }
    handleCustomizeReport(customizeMessage) {
        // 没有token,则不监听任何事件
        if (!Config.token) {
            throw Error('请输入一个合法token');
        }
        handleCustomizeReport(customizeMessage);
    }
    // 只支持更改用户的信息, 当获取到用户信息后，传入
    setUserInfo(userInfo) {
        const config = {
            user: userInfo,
        };
        setConfig(config);
    }
    sendPerf() {
        handlePerf();
    }
    // 发送资源
    sendResource() {
        'complete' === window.document.readyState ? handleResource() : this.addListenResource();
    }
    // 监听资源
    addListenResource() {
        on('load', handleResource);
    }
    // 监听行为
    addListenBehavior() {
        hackConsole();
        Config.behavior.click && this.addListenClick();
    }
    // 监听click
    addListenClick() {
        on('click', handleClick); // 非输入框点击，会过滤掉点击输入框
        on('blur', handleBlur); // 输入框失焦
        if (Config.isCountStayTime) {
            on('click', handleStayTime); // 非输入框点击，会过滤掉点击输入框
            on('blur', handleStayTime); // 输入框失焦
        }
    }
    // 监听路由
    addListenRouterChange() {
        hackState('pushState');
        hackState('replaceState');
        on('hashchange', handleHashchange);
        on('historystatechanged', handleHistorystatechange);
    }
    addListenVueError(Vue) {
        // quit if Vue isn't on the page
        if (!Vue || !Vue.config)
            return;
        // 为什么这么做？
        var _oldOnError = Vue.config.errorHandler;
        Vue.config.errorHandler = function (error, vm, info) {
            console.error(error);
            // console.log(error);
            // console.log(vm);
            // console.log(info)
            handleVueErr(error, vm, info);
            // if (typeof _oldOnError === 'function') {
            //   // 为什么这么做？
            //   _oldOnError.call(this, error, vm, info);
            // }
        };
    }
    addListenJs() {
        // js错误或静态资源加载错误
        on('error', handleErr);
        //promise错误
        on('unhandledrejection', handleErr);
        // window.addEventListener('rejectionhandled', rejectionhandled, true);
    }
    addListenAjax() {
        hackhook();
    }
    // beforeunload
    addListenUnload() {
        on('beforeunload', handleHealth);
        this.destroy();
    }
    addRrweb() { }
    // 移除路由
    removeListenRouterChange() {
        off('hashchange', handleHashchange);
        off('historystatechanged', handleHistorystatechange);
    }
    removeListenJs() {
        off('error', handleErr);
        off('unhandledrejection', handleErr);
    }
    // 监听资源
    removeListenResource() {
        off('beforeunload', handleHealth);
    }
    removeListenAjax() { }
    removeListenUnload() {
        off('load', handleResource);
    }
    removeRrweb() { }
    sum(key, val) {
        handleSum(key, val);
    }
    avg(key, val) {
        handleAvg(key, val);
    }
    msg(key) {
        handleMsg(key);
    }
    api(api, success, time, code, msg) {
        handleApi(api, success, time, code, msg);
    }
    destroy() {
        Config.enableSPA && this.removeListenRouterChange();
        Config.isError && this.removeListenJs();
        Config.isAjax && this.removeListenAjax();
        Config.isRecord && this.removeRrweb();
        Config.isResource && this.removeListenResource();
        this.removeListenResource();
    }
}

export default Tracer;
