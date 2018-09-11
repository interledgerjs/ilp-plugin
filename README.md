# ILP Plugin
> An ILP plugin loader

[![NPM Package](https://img.shields.io/npm/v/ilp-plugin.svg?style=flat)](https://npmjs.org/package/ilp-plugin)
[![CircleCI](https://circleci.com/gh/interledgerjs/ilp-plugin.svg?style=shield)](https://circleci.com/gh/interledgerjs/ilp-plugin)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Known Vulnerabilities](https://snyk.io/test/github/interledgerjs/ilp-plugin/badge.svg)](https://snyk.io/test/github/interledgerjs/ilp-plugin)

The script below will create an instance of an ILP plugin with no setup whatsoever.  You can
use this anywhere that you need an ILP plugin created from details in the
environment or by specifying the detauls in code.

## Changes in v4
  - The parameter `options.name` has been deprecated. 
  - The env parameter `ILP_CREDENTIALS` has been deprecated in favour of `ILP_OPTIONS`.
  - The module now includes type definitions for `Plugin` and related types and therefore exports both the type definitions and the `createPlugin` and `isPlugin` functions.

## Examples

Javascript:
```js
const plugin = require('ilp-plugin')()

async function run () {
  await plugin.connect()
  await plugin.sendData(/* ... */)
  process.exit(0)
}

run()
```

TypeScript:
```typescript
import createPlugin, { DataHandler } from '..'
const plugin = createPlugin()
const echo: DataHandler = (data: Buffer) => {
  return Promise.resolve(data)
}

async function run () {
  plugin.registerDataHandler(echo)
  await plugin.connect()
  await plugin.sendData(/* ... */)
  process.exit(0)
}

run()
```

If no parameters are provided it will attempt to find the config in environment variables. If these are not found it will load a plugin that attempts to connect to a local moneyd instance on port 7768.

The Environment variables that can be set are:

`ILP_PLUGIN` : The name/path of the plugin module
`ILP_PLUGIN_OPTIONS` : The options passed to the constructor, serialized as a JSON object.

The options object passed is a subset of the account configuration object proveded to `ilp-connector`.