const PING_INTERVAL = 10000  //ms
const FPS = 1000 / 60       
let videoRecording = false
 
const loadSelfCam = () => {
  if (videoRecording) return
  const canvas = document.getElementById('self-cam')
  const context = canvas.getContext('2d')
 
  context.height = canvas.height
  context.width = canvas.width
 
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msgGetUserMedia
  if (navigator.getUserMedia) {
    navigator.getUserMedia(
      { video: true },
      (stream) => {
        videoRecording = true
        document.getElementById('chat-video-src').srcObject = stream
        setInterval(() => {
          context.drawImage(document.getElementById('chat-video-src'), 0, 0, context.width, context.height)
 
          if (ws && ws.readyState === WebSocket.OPEN) {
            const topic = $('#topic-txt').val()
            writeToTopic(topic, { type: 'video', data: canvas.toDataURL('image/jpeg', 1.0) })
          }
        }, FPS) //??????????
      },
      (err) => console.error(err)
    )
  }
}
 
 
/** @type {WebSocket} */
let ws = null
 
let wsPingInterval = null
 
const onWsOpen = () => {
  console.log('Websocket connected to server')
}
 
const checkWsOpen = () => {
  if (!(ws && ws.readyState === WebSocket.OPEN)) {
    alert('Ws is not open yet')
    return false
  }
  return true
}
 
const onWsMessage = (ev) => {
  try {
    const msg = JSON.parse(ev.data.toString('utf-8'))
    const { from, topic, payload } = msg
    switch (topic) {
      case 'crypto': onCryptoTrade(payload); break
      case 'chat': {
        if (payload.type === 'video') {
          onVideoMessage(from, payload.data)
        } else {
          onMessage(from, payload.data)
        }
      } break
    }
  } catch (err) {
    console.error(err)
  }
}
 
const onWsError = (ev) => {
  console.error(ev)
}
 
const onWsClose = () => {
  console.log('Client closed')
 
  ws.removeEventListener('open', onWsOpen)
  ws.removeEventListener('message', onWsMessage)
  ws.removeEventListener('close', onWsClose)
  ws.removeEventListener('error', onWsError)
 
  alert('ws closed')
}
 
const openWs = () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    return
  }
 
  if (wsPingInterval) clearInterval(wsPingInterval)
  ws = new WebSocket('ws://127.0.0.1:7070')
  wsPingInterval = setInterval(() => {
    ws.send(JSON.stringify({ cmd: 'ping' }))
  }, PING_INTERVAL) 
 
  ws.addEventListener('open', onWsOpen)
  ws.addEventListener('message', onWsMessage)
  ws.addEventListener('close', onWsClose)
  ws.addEventListener('error', onWsError)
}
 
const subscribeToTopic = (topic) => {
  if (!checkWsOpen()) return
  if (!topic) return
 
  const msg = JSON.stringify({
    cmd: 'topic:sub',
    data: topic
  })
  ws.send(msg)
}
 
const unsubscribeToTopic = (topic) => {
  if (!checkWsOpen()) return
  if (!topic) return
 
  const msg = JSON.stringify({
    cmd: 'topic:unsub',
    data: topic
  })
  ws.send(msg)
}
 
const createTopic = (topic) => {
  if (!checkWsOpen()) return
  if (!topic) return
 
  const msg = JSON.stringify({
    cmd: 'topic:create',
    data: topic
  })
  ws.send(msg)
}
 
const writeToTopic = (topic, payload) => {
  if (!checkWsOpen()) return
  if (!topic || !payload) return
 
  const msg = JSON.stringify({
    cmd: 'topic:write',
    data: {
      topic: topic,
      payload: payload
    }
  })
  ws.send(msg)
}
 
/**
 * 
 * @param {{pair: 'string', price: number}[]} trades 
 */
const onCryptoTrade = (trades) => {
  const html = `
  <div class="crypto-trade">
    <table>
      ${trades.map(t => `<tr><td>${t.pair}</td><td>${t.price}</td></tr>`).join('\n')}
    </table>
  </div>`
  $('.crypto-trades').prepend(html)
}
 
const onMessage = (from, payload) => {
  const html = `
  <div class="w-100">
    <div class="chat-msg chat-msg-other">
      <div>From ${from}:</div>
      <div>${payload}</div>
    </div>
  </div>
  `
  pushMessage(html)
}
 
const onVideoMessage = (from, payload) => {
  let imgElem = document.getElementById(from)
  if (!imgElem) {
    $('.chat-video-container').append(`<img class="chat-video" id="${from}" />`)
    imgElem = document.getElementById(from)
  }
  imgElem.src = payload
}
 
const pushMessage = (html) => {
  const elem = $('.chat-body')
  elem.append(html)
  elem.scrollTop(elem.prop("scrollHeight"))
}
 
$(document).ready(() => {
  $('#msg-form').submit(e => {
    e.preventDefault()
    e.stopPropagation()
  })
  $('#topic-form').submit(e => {
    e.preventDefault()
    e.stopPropagation()
  })
 
  $('#ws-connect').click(() => {
    openWs()
  })
 
  $('#ws-crypto').click(() => {
    subscribeToTopic('crypto')
  })
 
  $('#ws-create').click(() => {
    const topic = $('#topic-txt').val()
    createTopic(topic)
  })
 
  $('#ws-sub').click(() => {
    const topic = $('#topic-txt').val()
    subscribeToTopic(topic)
  })
 
  $('#ws-unsub').click(() => {
    const topic = $('#topic-txt').val()
    unsubscribeToTopic(topic)
  })
 
  $('#send-msg').click(() => {
    const topic = $('#topic-txt').val()
    const msg = $('#msg-text').val()
    writeToTopic(topic, { type: 'text', data: msg })
    pushMessage(`
    <div class="w-100">
      <div class="chat-msg">${msg}</div>
    </div>`)
  })
 
  $('#send-video').click(() => {
    loadSelfCam()
  })
})