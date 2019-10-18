# Tracer

JavaScript APM Tracer , 前端监控SDK , 主要用于捕捉前端出现的异常情况

## dev

    ```
    npm run dev
    ```

## build

    ```
    npm run build
    ```

## example

参考example目录

## 功能

* 上报pv uv
* 捕获error
* 上报性能performance
* 上报用户轨迹
* 支持单页面
* hack ajax fetch
* 上报加载的资源
* hack console
* hack onpopstate
* 暴露全局变量__bb
* 埋点 sum avg msg

## 用法

    > tracer 必须在所有类库之前加载并初始化。否则会出现抓取不到错误的情况


## 参数说明

```
  // 上报地址
  reportUrl: 'http://localhost:10000',
  // 默认是 post 提交
  isPost: true,
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
  // 是否录屏
  isRecord: true,
  // 是否上报行为
  isBehavior: true,
  // 过滤错误,URL,api请求等
  ignore: {
    ignoreErrors: [],
    ignoreUrls: [],
    ignoreApis: ['/api/v1/report/web', 'livereload.js?snipver=1', '/sockjs-node/info'],
  },
  behavior: {
    console: ['log', 'error'], // 取值可以是"debug", "info", "warn", "log", "error"
    click: true,
  },
  // 最长上报数据长度
  maxLength: 1000,

```