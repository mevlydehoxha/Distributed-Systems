'use strict'

const uuid = require('uuid').v4
const debugClient = require('debug')('fiek-ws:client')
const debugTopic = require('debug')('fiek-ws:topic')
const WebSocketNode = require('ws')
const { Server } = WebSocketNode
const CONN_TIMEOUT = 15000
const CRYPTO_TIMEOUT = 10000

class FiekWS extends Server {
  /**
   * @param {WebSocketNode.ServerOptions} [options] 
   * @param {() => void} [callback] 
   */
  constructor (options, callback) {
    super(options, callback)

    /** @type {{ [key: string]: WebSocketNode }} */
    this._sockets = {}
    /** @type {{ [key: string]: NodeJS.Timeout }} */
    this._timeouts = {}
    /** @type {{ [key: string]: { write: boolean, uids: string[]} }} */
    this._channels = {}
  }

  init () {
    this.on('connection', (ws) => {
      const uid = uuid()
      this._sockets[uid] = ws

      ws.on('message', (data) => {
        try {
          const payload = JSON.parse(data.toString('utf-8'))
          this._onMessage(uid, payload)
        } catch (err) {
          ws.emit('error', err)
        }
      })

      ws.on('error', (err) => {
        debugClient('error from %s: %s', uid, err.toString())
        this._closeClient(uid)
      })

      ws.on('close', (code, reason) => {
        debugClient('client %s closed with code %d and reason %s', uid, code, reason)
        this._closeClient()
      })

      ws.on('ping', () => {
        this._stopTimeout()
        ws.pong()
        this._startTimeout()
      })
    })

    this._initCryptoChannel()
  }

  _initCryptoChannel () {
    this._channels['crypto'] = { write: false, uids: [] }
    this.trades = [
      { pair: 'BTCUSD', price: 6766.33 },
      { pair: 'ETHUSD', price: 142.33 },
      { pair: 'EOSUSD', price: 2.33 },
      { pair: 'XRPUSD', price: 0.18 }
    ]

    this._cryptoGenInterval = setInterval(() => {
      this.trades[0].price += Math.random()
      this.trades[1].price += Math.random()
      this.trades[2].price += Math.random() / 100
      this.trades[3].price += Math.random() / 1000

      this._writeTopic('srv', 'crypto', this.trades)
    }, CRYPTO_TIMEOUT)

    this.on('close', () => {
      clearInterval(this._cryptoGenInterval)
    })
  }

  /**
   * @param {string} uid
   * @param {{ cmd: string, data: any }} payload
   */
  _onMessage (uid, payload) {
    const { cmd, data } = payload
    switch (cmd) {
      case 'ping': this._pingFallback(uid); break
      case 'topic:sub': this._subscribeTopic(uid, data); break
      case 'topic:unsub': this._unsubscribeTopic(uid, data); break
      case 'topic:write': this._writeTopic(uid, data.topic, data.payload); break
      case 'topic:create': this._createTopic(uid, data); break
      default: throw new Error('ERR_INVALID_CMD')
    }
  }

  /**
   * @param {string} uid
   */
  _pingFallback (uid) {
    const client = this._sockets[uid]
    if (client && client.readyState === WebSocketNode.OPEN) {
      client.emit('ping')
    }
  }

  /**
   * @param {string} uid
   * @param {string} topic
   */
  _subscribeTopic (uid, topic) {
    const t = this._channels[topic]
    if (!t) throw new Error('ERR_INVALID_TOPIC')
    if (t.uids.findIndex(x => x === uid) < 0) {
      t.uids.push(uid)
      debugTopic('client %s subscribed to topic %s', uid, topic)
    }
  }

  /**
   * @param {string} uid
   * @param {string} topic
   */
  _unsubscribeTopic (uid, topic) {
    const t = this._channels[topic]
    if (!t) throw new Error('ERR_INVALID_TOPIC')
    t.uids = t.uids.filter(x => x !== uid)
    debugTopic('client %s unsubscribed from topic %s', uid, topic)
  }

  /**
   * @param {string} uid
   * @param {{ topic: string} topic
   * @param {any} payload
   */
  _writeTopic (uid, topic, payload) {
    const t = this._channels[topic]
    if (!t) throw new Error('ERR_INVALID_TOPIC')
    if (!t.write && uid !== 'srv') throw new Error('ERR_TOPIC_NOT_WRITEABLE')

    const msg = this._craftMsg(uid, topic, payload)
    for (const key of t.uids) {
      if (key === uid) continue
      const client = this._sockets[key]
      if (client && client.readyState === WebSocketNode.OPEN) {
        debugTopic('client %s send msg to topic %s', uid, topic)
        client.send(msg)
      }
    }
  }

  /**
   * @param {string} uid
   * @param {string} topic
   */
  _createTopic (uid, topic) {
    if (this._channels[topic]) throw new Error('ERR_TOPIC_EXITS')
    this._channels[topic] = { write: true, uids: [uid] }
    debugTopic('client %s ceated topic %s', uid, topic)
  }

  /**
   * @param {string} from
   * @param {string} topic
   * @param {any} payload
   */
  _craftMsg (from, topic, payload) {
    return JSON.stringify({ topic, from, payload })
  }

  /**
   * @param {string} uid
   */
  _startTimeout (uid) {
    this._stopTimeout(uid)
    this._timeouts[uid] = setTimeout(() => {
      debugClient('cliend %s timeout', uid)
      this._closeClient(uid)
    }, CONN_TIMEOUT)
  }

  /**
   * @param {string} uid
   */
  _stopTimeout (uid) {
    if (this._timeouts[uid]) {
      clearTimeout(this._timeouts[uid])
      delete this._timeouts[uid]
    }
  }


  /**
   * @param {string} uid
   */
  _closeClient (uid) {
    this._stopTimeout(uid)
    if (this._sockets[uid] && this._sockets[uid].readyState === WebSocketNode.OPEN) {
      this._sockets[uid].close()
      delete this._sockets[uid]
      Object.keys(this._channels).forEach(key => {
        this._channels[key].uids = this._channels[key].uids.filter(x => x !== uid)
      })
    }
  }
}

module.exports = FiekWS
