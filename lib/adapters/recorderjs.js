import { BufferRecording, ExportWave } from '../processors/'

var _ = require('underscore')
var $ = require('jquery')
var Observable = require('../mixins/Observable')
var RecorderJs = require('../recorderjs/recorder')
var audioContext

var RecorderJsAdapter = function RecorderJsAdapter(config) {
  this.initialize(config)
}

require('webrtc-adapter')
RecorderJsAdapter.isSupported = () => {
  // consider using browserDetails to specify exactly which browsers we are supporting here.
  return (
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    window.location.protocol === 'https:'
  )
}
RecorderJsAdapter.prototype = {
  initialize() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext
    window.OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext

    audioContext = audioContext || new window.AudioContext()
  },

  startRecording() {
    var self = this
    this.ensureRecorder().then((recorder) => {
      self.recorder = recorder
      recorder.record()
      self.notifyObservers('onStartedRecording', audioContext)
    })
  },

  ensureRecorder() {
    var d = $.Deferred()
    var self = this
    _.delay(() => {
      self.notifyObservers('onRecorderInitialized', audioContext)
      navigator.mediaDevices.getUserMedia({ audio: true }).then(
        (stream) => {
          var sourceStream = audioContext.createMediaStreamSource(stream)
          self.notifyObservers('onMediaStreamSourceCreated', sourceStream)
          d.resolve(new RecorderJs(sourceStream))
        },
        (e) => {
          console.log('RecorderCore#No live audio input: ' + e) // eslint-disable-line no-console
          d.reject(e)
        },
      )
    }, 0)
    return d
  },

  // this is no longer used by rels-lib
  // we take the exported wave blob and play that
  async startPlaying() {
    const buffer = BufferRecording(audioContext)
    const audioBuffer = await buffer(this.recorder)
    const source = audioContext.createBufferSource()

    source.buffer = audioBuffer
    source.connect(audioContext.destination)
    source.onended = () => {
      this.notifyObservers('onStoppedPlaying')
      delete this.source
    }

    this.source = source
    source.start(0)
    this.notifyObservers('onStartedPlaying')
  },

  async stopRecording() {
    const buffer = BufferRecording(audioContext)
    const exportWave = ExportWave(audioContext)
    if (this.recorder) {
      this.recorder.stop()

      const audioBuffer = await buffer(this.recorder)
      const leftChannel = audioBuffer.getChannelData(0)
      const waveFile = await exportWave(leftChannel)

      this.notifyObservers('onStoppedRecording', waveFile)
    }
  },

  stopPlaying() {
    this.source && this.source.stop()
  },

  // Resets the recording, releases observers
  remove() {
    this.reset()
    this.removeObservers()
  },

  _audioContextError(e) {
    switch (e.name) {
      case 'InvalidStateError':
        break
      default:
        throw e
    }
  },

  reset() {
    if (this.source) {
      this.source.onended = () => {
        /* noop */
      }
    }

    this.source && this.source.stop()
    this.recorder && this.recorder.stop()

    delete this.recorder
    delete this.source
  },
}
Observable.call(RecorderJsAdapter.prototype)
module.exports = RecorderJsAdapter
