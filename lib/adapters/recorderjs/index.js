import webrtcAdapter from 'webrtc-adapter' // eslint-disable-line no-unused-vars

import { BufferRecording, ExportWave } from './processors'
import Observable from '../../mixins/Observable'
import RecorderJs from './recorder'

var audioContext

var RecorderJsAdapter = function RecorderJsAdapter() {
  this.initialize()
}

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

  name: 'recorderjs',

  async startRecording() {
    try {
      this.recorder = await this.ensureRecorder()
      this.recorder.record()
      this.notifyObservers('onStartedRecording', audioContext)
    } catch (e) {
      console.log('RecorderCore#No live audio input: ' + e) // eslint-disable-line no-console
      throw e
    }
  },

  ensureRecorder() {
    this.notifyObservers('onRecorderInitialized', audioContext)
    return navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      var sourceStream = audioContext.createMediaStreamSource(stream)
      this.notifyObservers('onMediaStreamSourceCreated', sourceStream)
      return new RecorderJs(sourceStream)
    })
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
export default RecorderJsAdapter
