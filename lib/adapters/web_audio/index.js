import 'webrtc-adapter'
import { WEB_AUDIO } from '../../constants'
import { BufferRecording, ExportWave } from './processors'
import Observable from '../../mixins/Observable'
import Recorder from './recorder'

var audioContext

var WebAudio = function WebAudio() {
  this.initialize()
}

WebAudio.isSupported = () => {
  // consider using browserDetails to specify exactly which browsers we are supporting here.
  return (
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    window.location.protocol === 'https:'
  )
}

WebAudio.prototype = {
  initialize() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext
    window.OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext

    audioContext = audioContext || new window.AudioContext()
  },

  name: WEB_AUDIO,

  isAllowed() {
    return true
  },

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

  async stopRecording() {
    if (!this.recorder) {
      return
    }
    const buffer = BufferRecording(audioContext)
    const exportWave = ExportWave(audioContext)

    this.recorder.stop()

    const audioBuffer = await buffer(this.recorder)
    const leftChannel = audioBuffer.getChannelData(0)
    const waveFile = await exportWave(leftChannel)

    this.notifyObservers('onStoppedRecording', waveFile)
  },

  async ensureRecorder() {
    const { mediaDevices } = navigator
    const stream = await mediaDevices.getUserMedia({ audio: true })
    this.notifyObservers('onRecorderInitialized', audioContext)

    const sourceStream = audioContext.createMediaStreamSource(stream)
    this.notifyObservers('onMediaStreamSourceCreated', sourceStream)

    return new Recorder(sourceStream)
  },

  // remove post 2019.12 release
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

  // remove post 2019.12 release
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
Observable.call(WebAudio.prototype)
export default WebAudio
