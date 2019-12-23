import Observable from '../../mixins/Observable'
import Flash from './flash'

import {
  onStartedRecording,
  onStoppedRecording,
  RESET,
  REMOVE,
  recorderWrapper,
  START_RECORDING,
  STOP_RECORDING,
  RECORDER_INITIALIZED,
  RECORDER_STARTED,
  RECORDER_STOPPED,
  RECORD_START,
  RECORD_STOP,
  onRecorderInitialized,
  onRecorderStarted,
  onRecorderStopped,
} from '../../constants'

const withRecorder = Symbol('withRecorder')

class Swf {
  constructor() {
    Observable.call(this)

    new Flash().addObserver(this, [RECORDER_INITIALIZED, RECORDER_STARTED, RECORDER_STOPPED])
  }

  static isSupported() {
    return Flash.isSupported()
  }

  /* PRAGMA - incoming from adapter wrapper */

  [START_RECORDING]() {
    this[withRecorder](RECORD_START)
  }

  [STOP_RECORDING]() {
    this[withRecorder](RECORD_STOP)
  }

  [RESET]() {
    this[withRecorder](RESET)
  }

  [REMOVE]() {
    this[withRecorder](RESET)
    this[withRecorder](REMOVE)
    this.removeObservers()
  }

  /* PRAGMA - notifications from flash */

  [onRecorderInitialized](swfObject) {
    this[withRecorder] = recorderWrapper(swfObject)
  }

  [onRecorderStarted]() {
    this.notifyObservers(onStartedRecording)
  }

  [onRecorderStopped](audio) {
    this.notifyObservers(onStoppedRecording, audio)
  }

  /* eslint-disable-next-line class-methods-use-this */
  [withRecorder]() {
    // configured onRecorderInitialized
  }
}
export default Swf
