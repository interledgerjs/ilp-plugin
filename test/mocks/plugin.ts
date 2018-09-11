import { EventEmitter } from 'events'
import { DataHandler, MoneyHandler, PluginInstance } from '../..'
require('source-map-support').install()

class TestPlugin extends EventEmitter implements PluginInstance {

  static readonly version = 2
  public options: any


  constructor (options: any) {
    super()
    this.options = options
  }

  async connect () {
    return Promise.reject()
  }

  async disconnect () {
    return Promise.reject()
  }

  isConnected () {
    return false
  }

  async sendData (data: Buffer): Promise<Buffer> {
    return Promise.reject()
  }

  async sendMoney (amount: string): Promise<void> {
    return Promise.reject()
  }

  registerDataHandler (handler: DataHandler): void {
  }

  deregisterDataHandler (): void {
  }

  registerMoneyHandler (handler: MoneyHandler): void {
  }

  deregisterMoneyHandler (): void {
  }
}
export = TestPlugin