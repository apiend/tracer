// rollup.config.js
import * as path from 'path';
import resolve from 'rollup-plugin-node-resolve'; // 告诉 Rollup 如何查找外部模块
import typescript from 'rollup-plugin-typescript2'; // 编译typescript
import {
  terser
} from 'rollup-plugin-terser'; // 压缩输出用
import replace from 'rollup-plugin-replace'; // 编译时替换对应的字段
import json from '@rollup/plugin-json'; // 读取json信息的
import commonjs from 'rollup-plugin-commonjs';

import config from "./package.json";

const useTypescript = true; // 是否使用typescript 默认为false

// 打包的各个不同环境配置
const builds = {
  'iife-dev': {
    outFile: 'tracer.iife.js', //
    format: 'iife',
    mode: 'development',
  },
  'iife-prod': {
    outFile: 'tracer.th.min.js',
    format: 'iife',
    mode: 'production',
  },
  'cjs-dev': {
    outFile: 'tracer.js',
    format: 'cjs',
    mode: 'development',
  },
  'cjs-prod': {
    outFile: 'tracer.min.js',
    format: 'cjs',
    mode: 'production',
  },
  'umd-dev': {
    outFile: 'tracer.umd.js',
    format: 'umd',
    mode: 'development',
  },
  'umd-prod': {
    outFile: 'tracer.umd.min.js',
    format: 'umd',
    mode: 'production',
  },
  'umd-th':{
    outFile: `tracer.umd.min.${config.version}.js`,
      format: 'umd',
      mode: 'production',
  },
  'es-dev': {
    outFile: 'tracer.module.js',
    format: 'es',
    mode: 'development',
  },
  'es-prod': {
    outFile: 'tracer.module.min.js',
    format: 'es',
    mode: 'production',
  },
};

function getAllBuilds() {
  return Object.keys(builds).map(key => getConfig(builds[key]));
}

function getConfig({
  outFile,
  format,
  mode
}) {
  const isProd = mode === 'production';

  return {
    input: useTypescript ? './src/index.ts' : './src/index.js',
    output: {
      file: path.join('./dist', outFile),
      format: format,
      globals: {
        vue: 'Vue',
      },
      // exports: 'named',
      name: format === 'umd' ? 'Tracer' : undefined,
    },
    plugins: [
      commonjs({
        // non-CommonJS modules will be ignored, but you can also
        // specifically include/exclude files
        include: 'node_modules/**', // Default: undefined
      }),
      json(),
      useTypescript &&
      typescript({
        typescript: require('typescript'),
        check: true,
      }),
      resolve({
        jsnext: true,
        main: true,
        browser: true
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
      }),
      isProd && terser(),
    ].filter(Boolean),
  };
}

let buildConfig;

// 如果指定了打包环境就打对应的包 不然就打全量的包
if (process.env.TARGET) {
  buildConfig = getConfig(builds[process.env.TARGET]);
} else {
  buildConfig = getAllBuilds();
}

export default buildConfig;