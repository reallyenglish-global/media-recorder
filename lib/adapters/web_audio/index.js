import 'webrtc-adapter'
import { RELEASE, REMOVE } from '../../constants'
import { BufferRecording, ExportWave } from './processors'
import Observable from '../../mixins/Observable'
import Recorder from './recorder'
import {
  onRecorderInitialized,
  onMediaStreamSourceCreated,
  onStartedRecording,
  onStoppedRecording,
  recorderWrapper,
} from '../../constants'

var audioContext

window.AudioContext = window.AudioContext || window.webkitAudioContext
window.OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext

const withRecorder = Symbol('withRecorder')
class WebAudio {
  constructor() {
    audioContext = audioContext || new window.AudioContext()
    Observable.call(this)
  }

  static isSupported() {
    return (
      typeof window.AudioContext === 'function' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      window.location.protocol === 'https:'
    )
  }

  [withRecorder](method) {
    this.last = method
  }

  async getWave() {
    const buffer = BufferRecording(audioContext)
    const exportWave = ExportWave(audioContext)
    const audioBuffer = await buffer(this[withRecorder]())
    const leftChannel = audioBuffer.getChannelData(0)
    const waveFile = await exportWave(leftChannel)

    return waveFile
  }

  async startRecording() {
    try {
      await this.ensureRecorder()
      this[withRecorder]('record')
      this.notifyObservers(onStartedRecording, audioContext)
    } catch (e) {
      console.log('RecorderCore#No live audio input: ' + e) // eslint-disable-line no-console
      throw e
    }
  }

  async stopRecording() {
    this[withRecorder]('stop')
    const wave = await this.getWave()
    this.notifyObservers(onStoppedRecording, wave)
    this[withRecorder](RELEASE)
    this[withRecorder](REMOVE)
    this[withRecorder] = WebAudio.prototype[withRecorder]
  }

  async ensureRecorder() {
    const { mediaDevices } = navigator
    const stream = await mediaDevices.getUserMedia({ audio: true })
    this.notifyObservers(onRecorderInitialized, audioContext)

    const sourceStream = audioContext.createMediaStreamSource(stream)
    this.notifyObservers(onMediaStreamSourceCreated, sourceStream)

    const recorder = new Recorder(sourceStream)
    this[withRecorder] = recorderWrapper(recorder)
  }

  // Resets the recording, releases observers
  remove() {
    this.reset()
    this[withRecorder](RELEASE)
    this[withRecorder](REMOVE)
    this.removeObservers()
  }

  reset() {
    this[withRecorder]('stop')
  }
}
export default WebAudio
