import Observable from '../../mixins/Observable'
import Flash from './flash'

import {
  RESET,
  REMOVE,
  onReset,
  onRemove,
  START_RECORDING,
  onStartRecording,
  onStartedRecording,
  STOP_RECORDING,
  onStopRecording,
  onStoppedRecording,
  RECORDER_INITIALIZED,
  onRecorderInitialized,
  RECORDER_STARTED,
  onRecorderStarted,
  RECORDER_STOPPED,
  onRecorderStopped,
} from '../../constants'

class Swf {
  constructor() {
    Observable.call(this)

    new Flash()
      .addObserver(this, [RECORDER_INITIALIZED, RECORDER_STARTED, RECORDER_STOPPED])
      .observe(this, [START_RECORDING, STOP_RECORDING])
  }

  static isSupported() {
    return Flash.isSupported()
  }

  /* PRAGMA - incoming from adapter wrapper */

  [START_RECORDING]() {
    this.notifyObservers(onStartRecording)
  }

  [STOP_RECORDING]() {
    this.notifyObservers(onStopRecording)
  }

  [RESET]() {
    this.notifyObservers(onReset)
  }

  [REMOVE]() {
    this.notifyObservers(onReset)
    this.notifyObservers(onRemove)
    this.removeObservers()
  }

  /* PRAGMA - notifications from flash */

  [onRecorderInitialized]() {
    this.notifyObservers(onRecorderInitialized)
  }

  [onRecorderStarted]() {
    this.notifyObservers(onStartedRecording)
  }

  [onRecorderStopped](audio) {
    this.notifyObservers(onStoppedRecording, audio)
  }
}
export default Swf
