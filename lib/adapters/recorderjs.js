var _ = require('underscore')
var $ = require('jquery')
var Observable = require('../mixins/Observable')
var RecorderJs = require('../recorderjs/recorder')
var encodeWave = require('../recorderjs/encodeWave')
var audioContext
var AudioProcessors = require('../processors/')

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

  startPlaying() {
    AudioProcessors.Buffer.configure({
      recorder: this.recorder,
      sampleRate: audioContext.sampleRate,
    })
      .process()
      .then(
        _.bind(function play(audioBuffer) {
          var source = audioContext.createBufferSource()
          source.buffer = audioBuffer
          source.connect(audioContext.destination)
          source.onended = _.bind(function notify() {
            this.notifyObservers('onStoppedPlaying')
            delete this.source
          }, this)
          this.source = source
          source.start(0)
          this.notifyObservers('onStartedPlaying')
        }, this),
      )
  },

  stopRecording() {
    if (this.recorder) {
      this.recorder.stop()
      AudioProcessors.Buffer.configure({
        recorder: this.recorder,
        sampleRate: audioContext.sampleRate,
      })
        .process()
        .then(
          AudioProcessors.Resample.configure({
            numChannels: 2,
            sampleRate: window.webkitAudioContext ? 44100 : 16000,
          }).process,
        )
        .then((audioBuffer) => {
          return audioBuffer.getChannelData(0)
        })
        .then(encodeWave)
        .then(
          _.bind(function notify(waveFile) {
            this.notifyObservers('onStoppedRecording', waveFile)
          }, this),
        )
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

    delete this.recording
    delete this.recorder
    delete this.source
  },
}
Observable.call(RecorderJsAdapter.prototype)
module.exports = RecorderJsAdapter
