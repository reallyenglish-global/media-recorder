import { findAdapter } from './adapters'
import Observable from './mixins/Observable'

import {
  RECORDER_INITIALIZED,
  MEDIA_STREAM_SOURCE_CREATED,
  STARTED_RECORDING,
  STOPPED_RECORDING,
  START_RECORDING,
  STOP_RECORDING,
  REMOVE,
  RESET,
  recorderWrapper,
} from './constants'

const relay = [
  RECORDER_INITIALIZED,
  MEDIA_STREAM_SOURCE_CREATED,
  STARTED_RECORDING,
  STOPPED_RECORDING,
]

export {
  WEB_AUDIO,
  MOBILE,
  SWF,
  MEDIA_STREAM_SOURCE_CREATED,
  RECORDER_INITIALIZED,
  STARTED_RECORDING,
  STOPPED_RECORDING,
  UNSUPPORTED,
} from './constants'

const withAdapter = Symbol('withAdapter')

/*
 * Initialize a recording object
 *
 * @param {Object} [options]
 * @param {String} [options.swfPath] Path to the fallback SWF file
 *
 */

class Recorder {
  constructor({ adapterName = '' } = {}) {
    this.relay = relay

    Observable.call(this)

    const Adapter = findAdapter(adapterName)

    const adapter = Adapter ? new Adapter().addObserver(this, relay) : undefined

    this[withAdapter] = recorderWrapper(adapter)
  }

  [withAdapter](method) {
    this.last = {
      method,
      name: 'unsupported',
    }
  }

  using() {
    return this[withAdapter]('name')
  }

  startRecording() {
    this[withAdapter](START_RECORDING)
  }

  stopRecording() {
    this[withAdapter](STOP_RECORDING)
  }

  reset() {
    this[withAdapter](RESET)
  }

  remove() {
    this[withAdapter](REMOVE)
    this.removeObservers()
  }
}

Observable.call(Recorder.prototype)
export default Recorder

if (process.env && process.env.NODE_ENV === 'development') {
  window.Recorder = Recorder
}
