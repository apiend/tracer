import { Config, setConfig } from './config';
import {
  handleErr,
  handleVueErr,
  handlePv,
  handlePerf,
  handleHashchange,
  handleHistorystatechange,
  handleClick,
  handleBlur,
  handleResource,
  handleSum,
  handleAvg,
  handleMsg,
  handleHealth,
  handleApi,
  handleStayTime,
  handleCustomizeReport,
  setPage,
  listenMessageListener,
  listenCircleListener,
  removeCircleListener,
} from './handlers';
import { on, off, parseHash } from './utils/tools';
import { hackState, hackConsole, hackhook } from './hack';
import { setGlobalPage, setGlobalSid, setGlobalHealth, GlobalVal } from './config/global';

export default class Tracer {
  constructor(options, fn) {
    this.init(options);
  }

  init({ Vue, ...options }) {
    // 没有token,则不监听任何事件
    if (options && !options.token) {
      throw Error('请输入一个token');
      return;
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
    if (!Vue || !Vue.config) return;

    // 为什么这么做？
    var _oldOnError = Vue.config.errorHandler;

    Vue.config.errorHandler = function(error, vm, info) {
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

  addRrweb() {}

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

  removeListenAjax() {}

  removeListenUnload() {
    off('load', handleResource);
  }

  removeRrweb() {}

  sum(key: string, val: number) {
    handleSum(key, val);
  }

  avg(key: string, val: number) {
    handleAvg(key, val);
  }

  msg(key: string) {
    handleMsg(key);
  }

  api(api, success, time, code, msg) {
    handleApi(api, success, time, code, msg, Date.now());
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
