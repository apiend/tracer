## Tracer 

> 最新版本 2.1.4

JavaScript APM Tracer , 前端监控SDK , 主要用于捕捉前端出现的异常情况


### Github 

  https://github.com/apiend/tracer

### dev

    ```
    npm run dev
    ```

### build

    ```
    npm run build
    ```

### example

参考example目录

### 功能

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

### 用法

token在 tracer-system 后台申请
 
### 方法一

```html
  <script src='../dist/tracer.js'></script>
  <script>
    new Tracer({
      token: 'xxx',
      reportUrl: 'http://127.0.0.1:7002/api/v1/report/web'
    })
  </script>
```

### 方法二
```
npm i @diogoxiang/tracer -S
```

```js
import Tracer from '@diogoxiang/tracer'
或 var Tracer = require('Tracer')

new Tracer({
  token: 'xxxx',
  reportUrl: 'http://127.0.0.1:7002/api/v1/report/web'
})
```

### 配置

```js
{
  // 上报地址
  reportUrl: 'http://localhost:10000',
  // 批量上报地址 当配置了这个字段的时候，会将用户行为集成加载
  reportUrlMultiple: '',
  // 最长缓存长度
  maxCacheLength: 20,
  // 提交参数
  token: '',
  // app版本
  // appVersion: '1.0.0', 无用
  // Vue的类
  Vue: '',
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
  ignore: {
    // 忽略错误
    ignoreErrors: [],
    // 忽略地址相关
    ignoreUrls: [],
    ignorePvs: ['404'],
    // 忽略资源请求
    ignoreResources: [],
    // 忽略接口请求
    ignoreApis: ['/api/v1/report/web', 'livereload.js?snipver=1', '/sockjs-node/info'],
    // 忽略用户行为元素
    ignoreBehaviorEles: []
  },
  behavior: {
    console: ['log', 'error'], // 取值可以是"debug", "info", "warn", "log", "error"
    click: true,
  },
  // 最长上报数据长度
  maxLength: 1000,
  // 当前用户信息
  user: {},
  // 是否需要推送消息到kafaka
  needPushtoKafaka: false
}

```

### 设置用户信息

通过调用Tracer实例化后的setUserInfo函数来设置用户的相关信息

### 监听vue的errorHandler错误

在实例化Tracer时传入Vue对象即可监听

```
new Tracer({
  token: 'wnrnhkh1585620953820',
  reportUrl: 'http://127.0.0.1:7002/api/v1/report/web',
  user: {
    userId: '333333'
  },
  Vue: Vue
})
```

### 上传自定义行为

通过调用实例化的Tracer的handleCustomizeReport函数即可上传，注意参数t为必传字段，表示的是类型，目前只有传t=app.click才可以透传到java后台中的kafaka

目前定义的几个类型分别为

```
  TracerInstance.handleCustomizeReport({
    t: 'app.click',
    moduleName: 'help-center',
    clickId: '77777777777'
  })

  TracerInstance.handleCustomizeReport({
    t: 'searchBehaivor',
    searchValue: '哈哈哈',
    searchType: '2'
  })

  TracerInstance.handleCustomizeReport({
    t: 'collectBehaivor',
    moduleName: 'help-center',
    clickId: '77777777777'
  })

```



### notice 
目前解析userAgent用的是一个老版本的库ua-device,下载下来的依赖源码又一个问题，打包的时候需要修改一下ua-device的lib文件下useragent-base.js中的detect函数第一行增加一个var match



<!-- ![avatar](/example/fix.png) -->

图片加载失败之后循环调用的问题是因为vconsole的原因造成的



### Changelog 更新日志

#### v2.0.8 2021-1-25 11:28:17
- 修改 isResource(页面资源数据), isBehavior(上报行为), isAjax(ajax 监听) 默认为 false  如有需求.可初始化开启
- 删除配置参数 needPushtoKafaka 


#### 2021-1-8 11:23:18
- Config.maxLength 限制改为100 方便监听 ajax 的数据,及上报的数据

#### 2021-1-6 17:29:58
- 修复 自定义上报的一些问题

#### 2020-12-22 10:36:12
- 优化 device 参数的


#### 2020-12-11 17:7:50
- SDK版本默认取package.json 中的配置

#### 2020-11-23 11:26:45
- 删除一些默认配置,只默认只开启 error, pv, ajax性能数据


#### 修复BUG
- TypeError: Converting circular structure to JSON