const fs = require('fs')
const path = require('path')
const log = require('ilp-logger')('ilp-plugin')
const crypto = require('crypto')

function pluginFromEnvironment (opts) {
  const module = process.env.ILP_PLUGIN || 'ilp-plugin-btp'
  const credentials = generateCredentials(opts)

  log.debug('creating plugin with module', module)
  log.debug('creating plugin with credentials', credentials)
  const Plugin = require(module)
  return new Plugin(credentials)
}

function generateCredentials (opts) {
  if (process.env.ILP_CREDENTIALS) {
    return JSON.parse(process.env.ILP_CREDENTIALS)
  }

  const secret = require('crypto').randomBytes(16).toString('hex')
  const name = (opts && opts.name) || ''
  const server = process.env.ILP_BTP_SERVER || 'localhost:7768'

  return { server: `btp+ws://${name}:${secret}@${server}` }
}

module.exports = pluginFromEnvironment
