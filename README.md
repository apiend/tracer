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
