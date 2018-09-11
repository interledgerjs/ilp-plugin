import 'mocha'
import createPlugin, { isPlugin } from '..'
import * as sinon from 'sinon'
import * as Chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
Chai.use(chaiAsPromised)
const assert = Object.assign(Chai.assert, sinon.assert)
require('source-map-support').install()

describe('ilp-plugin', function () {
  beforeEach(function () {
    delete(process.env['ILP_PLUGIN'])
    delete(process.env['ILP_PLUGIN_OPTIONS'])
  })

  describe('createPlugin', function () {
    it('should return an instance of a plugin', function () {
      const plugin = createPlugin()
      assert(typeof(plugin.connect) === 'function')
      assert(typeof(plugin.disconnect) === 'function')
      assert(typeof(plugin.isConnected) === 'function')
      assert(typeof(plugin.sendData) === 'function')
      assert(typeof(plugin.sendMoney) === 'function')
      assert(typeof(plugin.registerDataHandler) === 'function')
      assert(typeof(plugin.deregisterDataHandler) === 'function')
      assert(typeof(plugin.registerMoneyHandler) === 'function')
      assert(typeof(plugin.deregisterMoneyHandler) === 'function')
    })

    it('should use ilp-plugin-btp if no module name is provided', function () {
      const plugin = createPlugin()
      assert(plugin.constructor.name === "AbstractBtpPlugin")
    })

    it('should throw an error if the provided module is not found', function () {
      assert.throws(() => createPlugin({plugin: 'non-existent-module'}), /Cannot find module \'non-existent-module\'/)
    })

    it('should throw an error if the provided module is not a plugin', function () {
      assert.throws(() => createPlugin({plugin: 'crypto'}))
    })

    it('should load the named module', function () {
      const plugin = createPlugin({plugin: '../test/mocks/plugin', options: { test: true}})
      assert(plugin.constructor.name === "TestPlugin")
    })

    it('should load the plugin with the given options', function () {
      const plugin = createPlugin({plugin: '../test/mocks/plugin', options: { test: true}})
      assert((plugin as any).options.test)
    })

    it('should load the plugin named in env var ILP_PLUGIN if available', function () {
      process.env['ILP_PLUGIN'] = '../test/mocks/plugin'
      const plugin = createPlugin()
      assert(plugin.constructor.name === "TestPlugin")
    })

    it('should prefer the plugin named in parameters over the env var ILP_PLUGIN', function () {
      process.env['ILP_PLUGIN'] = 'ilp-plugin-btp'
      const plugin = createPlugin({plugin: '../test/mocks/plugin', options: { test: true}})
      assert(plugin.constructor.name === "TestPlugin")
    })

    it('should load the options in env var ILP_PLUGIN_OPTIONS if available', function () {
      process.env['ILP_PLUGIN'] = '../test/mocks/plugin'
      process.env['ILP_PLUGIN_OPTIONS'] = '{"test":"true"}'
      const plugin = createPlugin()
      assert(plugin.constructor.name === "TestPlugin")
      assert((plugin as any).options.test)
    })


    it('should prefer the options named in parameters over the env var ILP_PLUGIN_OPTIONS', function () {
      process.env['ILP_PLUGIN'] = 'ilp-plugin-btp'
      process.env['ILP_PLUGIN_OPTIONS'] = '{"test1":"true"}'
      const plugin = createPlugin({plugin: '../test/mocks/plugin', options: { test2: true}})
      assert((plugin as any).options.test1 === undefined)
      assert((plugin as any).options.test2)
    })

  })

  describe('isPlugin', function () {
    beforeEach(function () {
      delete(process.env['ILP_PLUGIN'])
      delete(process.env['ILP_PLUGIN_OPTIONS'])
    })

    it('should return false for {}', function () {
      assert(isPlugin({}) === false)
    })
    it('should return true for createPlugin()', function () {
      assert(isPlugin(createPlugin()))
    })
    it('should return true for TestPlugin', function () {
      assert(isPlugin(createPlugin({plugin: '../test/mocks/plugin'})))
    })
  })
})