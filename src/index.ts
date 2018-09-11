import * as crypto from 'crypto'
import * as path from 'path'
import { EventEmitter } from 'events'
const createLogger = require('ilp-logger')
const log = createLogger('ilp-plugin')
require('source-map-support').install()

interface FunctionWithVersion extends Function {
  version?: number
}
export interface ConnectOptions {
  timeout?: number
}
export type DataHandler = (data: Buffer) => Promise<Buffer>
export type MoneyHandler = (amount: string) => Promise<void>
export interface PluginInstance extends EventEmitter {
  constructor: FunctionWithVersion
  connect: (options?: ConnectOptions) => Promise<void>
  disconnect: () => Promise<void>
  isConnected: () => boolean
  sendData: DataHandler
  sendMoney: MoneyHandler
  registerDataHandler: (handler: DataHandler) => void
  deregisterDataHandler: () => void
  registerMoneyHandler: (handler: MoneyHandler) => void
  deregisterMoneyHandler: () => void
  getAdminInfo? (): Promise<object>
  sendAdminInfo? (info: object): Promise<object>
}

/**
 * A type guard for ILP plugins
 *
 * See https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards
 *
 * @param plugin a class to test
 */
export function isPlugin (plugin: any): plugin is PluginInstance {
  return plugin.connect !== undefined &&
    plugin.disconnect !== undefined &&
    plugin.isConnected !== undefined &&
    plugin.sendData !== undefined &&
    plugin.sendMoney !== undefined &&
    plugin.registerDataHandler !== undefined &&
    plugin.deregisterDataHandler !== undefined &&
    plugin.registerMoneyHandler !== undefined &&
    plugin.deregisterMoneyHandler !== undefined
}

export const DEFAULT_PLUGIN_MODULE = 'ilp-plugin-btp'

export interface PluginServices {
  store: any
  log: Logger
}

export interface CreatePluginOptions {
  plugin?: string
  options?: {
    [k: string]: any
  }
  /** @deprecated in favour of appropriate options for the plugin */
  name?: string
}

/**
 * Create an instance of an ILP plugin
 *
 * This function loads an instance of an ILP plugin.
 *
 * The constructor options for the plugin and the module name of the plugin can be passed to the function as parameters.
 * If no parameters are provided then it will attempt to find the config in environment variables.
 * If these are not found it will load a plugin that attempts to connect to a local moneyd instance on port 7768.
 *
 * The Environment variables that can be set are:
 *  - ILP_PLUGIN : The name/path of the plugin module
 *  - ILP_PLUGIN_OPTIONS : The options passed to the constructor, serialized as a JSON object.
 *
 * Example 1: Explicit config
 *
 * ```js
 * const plugin = require('ilp-plugin')({
 *     plugin : 'ilp-plugin-btp',
 *     options : {
 *         server : "btp+ws://myname:0a0cfd180fb5a5d32ebdf5344ce9c076@localhost:7768"
 *     }
 * })
 * // The plugin module can be ommitted if using the default, ilp-plugin-btp
 * const plugin = require('ilp-plugin')({
 *     options : {
 *         server : "btp+ws://myname:0a0cfd180fb5a5d32ebdf5344ce9c076@localhost:7768"
 *     }
 * })
 * ```
 *
 * Example 2: Config from env
 *
 * ```sh
 *  $ ILP_PLUGIN="ilp-plugin-btp" \
 *    ILP_PLUGIN_OPTIONS="{\"server\":\"btp+ws://myname:0a0cfd180fb5a5d32ebdf5344ce9c076@localhost:7768\"}" \
 *    node app.js
 * ```
 *
 * Where `app.js` has the following:
 *
 * ```js
 * const plugin = require('ilp-plugin')()
 * ```
 */
const createPlugin = function (options?: CreatePluginOptions, services?: PluginServices): PluginInstance {

  const envOptions = process.env.ILP_PLUGIN_OPTIONS || process.env.ILP_CREDENTIALS

  // TODO: Deprecated behaviour can be removed in future
  if (process.env.ILP_CREDENTIALS && !process.env.ILP_PLUGIN_OPTIONS) {
    log.warn(`Loading options from environment variable ILP_CREDENTIALS is deprecated, use ILP_PLUGIN_OPTIONS instead.`)
  }

  const moduleName = (options && options.plugin) ? options.plugin : (process.env.ILP_PLUGIN || DEFAULT_PLUGIN_MODULE)
  const moduleNameSource = (options && options.plugin) ? 'parameter' : ((process.env.ILP_PLUGIN) ? 'environment' : 'default')
  const pluginOptions = (options && options.options) ? options.options : (envOptions ? JSON.parse(envOptions) : {})
  const optionsSource = (options && options.options) ? 'parameter' : ((envOptions) ? 'environment' : 'default')

  if (moduleName === DEFAULT_PLUGIN_MODULE) {
    // Required for backwards compatability
    // TODO: Deprecated behaviour can be removed in future
    /* tslint:disable-next-line:deprecation */
    const name = (options && options.name) || ''
    if (name) {
      log.warn(`'options.name' is deprecated. ` +
        `Please provide the correct options for the plugin. ` +
        `Example: options.server = "btp+ws://<name>:<secret>@localhost:7768" for a BTP plugin.`)
    }
    if (Object.keys(pluginOptions).length === 0) {
      log.debug(`Generating random secret to connect to local BTP server.`)
      pluginOptions.server = `btp+ws://${name}:${crypto.randomBytes(16).toString('hex')}@localhost:7768`
    }
  }
  log.debug(`Loading module '${moduleName}' defined via ${moduleNameSource}.`)
  const PluginConstructor = require(moduleName)
  log.debug(`Creating plugin using options defined via ${optionsSource}.`)
  try {
    const plugin = new PluginConstructor(pluginOptions, services)
    if (!isPlugin(plugin)) {
      log.error(`${moduleName} is not a valid plugin.`)
      throw Error(`Invalid module: '${moduleName}'`)
    }
    return plugin
  } catch (e) {
    log.error(`Unable to create instance of plugin from '${moduleName}' module. Does it export a plugin constructor?`)
    throw e
  }
} as ModuleExport

interface ModuleExport {
  (options?: CreatePluginOptions, services?: PluginServices): PluginInstance
  default: ModuleExport
  isPlugin: (plugin: any) => plugin is PluginInstance
}

createPlugin.default = createPlugin
createPlugin.isPlugin = isPlugin
export default createPlugin

module.exports = createPlugin
