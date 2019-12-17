import { onStartedRecording, onStoppedRecording, recorderWrapper } from '../../constants'

import Observable from '../../mixins/Observable'

/* mobile recorder events */
export const ERROR = 'error'
export const RECORDING_STOPPED = 'recording:stopped'
export const RECORDING_STARTED = 'recording:started'

/* mobile recorder methods */
const START_RECORD = 'startRecord'
const STOP_RECORD = 'stopRecord'
const RELEASE = 'release'
const REMOVE = 'remove'

const relay = [ERROR, RECORDING_STARTED, RECORDING_STOPPED]

const withRecorder = Symbol('withRecorder')

class Mobile {
  constructor() {
    const Recorder = window.rels.mobile.recorder
    const recorder = new Recorder().addObserver(this, relay)

    this[withRecorder] = recorderWrapper(recorder)

    Observable.call(this)
  }

  [withRecorder](method) {
    this.last = method
  }

  static isSupported() {
    try {
      return typeof window.rels.mobile.recorder === 'function'
    } catch (e) {
      return false
    }
  }

  startRecording() {
    this[withRecorder](START_RECORD)
  }

  stopRecording() {
    this[withRecorder](STOP_RECORD)
  }

  remove() {
    this.reset()
    this[withRecorder](RELEASE)
    this[withRecorder](REMOVE)
    this.removeObservers()
  }

  reset() {
    this.stopRecording()
  }

  onRecordingStopped(data) {
    this.notifyObservers(onStoppedRecording, data)
  }

  onRecordingStarted() {
    this.notifyObservers(onStartedRecording)
  }

  onError(error) {
    this.error = error
  }
}
export default Mobile
