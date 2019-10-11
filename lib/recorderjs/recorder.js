var WORKER_PATH = './recorderWorker.js'
var Recorder = function Recorder(source, cfg) {
  var config = cfg || {}
  var bufferLen = config.bufferLen || 4096
  var numChannels = config.numChannels || 2
  this.context = source.context
  this.node = (this.context.createScriptProcessor || this.context.createJavaScriptNode).call(
    this.context,
    bufferLen,
    numChannels,
    numChannels,
  )
  let worker = new Worker(WORKER_PATH)
  worker.postMessage({
    command: 'init',
    config: {
      sampleRate: this.context.sampleRate,
      numChannels: numChannels,
    },
  })
  let recording = false
  let currCallback
  this.node.onaudioprocess = (e) => {
    if (!recording) return
    let buffer = []
    for (let channel = 0; channel < numChannels; channel++) {
      buffer.push(e.inputBuffer.getChannelData(channel))
    }
    worker.postMessage({
      command: 'record',
      buffer: buffer,
    })
  }

  this.configure = (options) => {
    Object.assign(config, options)
  }

  this.record = () => {
    recording = true
  }

  this.stop = () => {
    recording = false
  }

  this.clear = () => {
    worker.postMessage({ command: 'clear' })
  }

  this.getBuffer = (cb) => {
    currCallback = cb || config.callback
    worker.postMessage({ command: 'getBuffer' })
  }

  this.exportWAV = (cb, type) => {
    currCallback = cb || config.callback
    type = type || config.type || 'audio/wav' // eslint-disable-line no-param-reassign
    if (!currCallback) throw new Error('Callback not set')
    worker.postMessage({
      command: 'exportWAV',
      type: type,
    })
  }

  worker.onmessage = (e) => {
    var blob = e.data
    currCallback(blob)
  }

  source.connect(this.node)
  this.node.connect(this.context.destination) // this should not be necessary
}
Recorder.forceDownload = (blob, filename) => {
  var url = (window.URL || window.webkitURL).createObjectURL(blob)
  var link = window.document.createElement('a')
  var click = document.createEvent('Event')
  link.href = url
  link.download = filename || 'output.wav'
  click.initEvent('click', true, true)
  link.dispatchEvent(click)
}

module.exports = Recorder
