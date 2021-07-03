'use strict'

const debug = require('debug')('fiek-ws:instance')
const yargs = require('yargs')
  .alias('p', 'port')
  .alias('h', 'host')
  .option('port', { type: 'number', required: true })
  .option('host', { type: 'string', required: true })
  .argv

const FiekWS = require('./fiek-ws')

const { port, host } = yargs
const server = new FiekWS({
  port: port, host: host
})

server.on('listening', () => {
  server.init()
  console.log('Server started listeing on %s:%d', host, port)
})
