import Observable from '../../mixins/Observable'
import Flash from './flash'

import {
  onStartedRecording,
  onStoppedRecording,
  RESET,
  REMOVE,
  recorderWrapper,
  RECORDER_INITIALIZED,
  RECORDER_STARTED,
  onRecorderInitialized,
  onRecorderStarted,
} from '../../constants'

const withRecorder = Symbol('withRecorder')

class Swf {
  constructor() {
    Observable.call(this)
    new Flash().addObserver(this, [RECORDER_STARTED, RECORDER_INITIALIZED])
  }

  static isSupported() {
    return Flash.isSupported()
  }

  [withRecorder](method) {
    this.last = method
  }

  startRecording() {
    this[withRecorder]('recordStart')
  }

  getWave() {
    const base64 = this[withRecorder]('wavData')
    const buffer = atob(base64)
    const arr = new Uint8Array([...buffer].map((char) => char.charCodeAt(0)))
    return new Blob([arr], { type: 'audio/wav' })
  }

  stopRecording() {
    this[withRecorder]('recordStop')
    this.notifyObservers(onStoppedRecording, this.getWave())
  }

  [RESET]() {
    this[withRecorder](RESET)
  }

  [REMOVE]() {
    this[withRecorder](RESET)
    this[withRecorder](REMOVE)
    this.removeObservers()
  }

  [onRecorderInitialized](recorder) {
    this[withRecorder] = recorderWrapper(recorder)
  }

  [onRecorderStarted]() {
    this.notifyObservers(onStartedRecording)
  }
}
export default Swf
