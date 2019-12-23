import { findAdapter } from './adapters/'
import Observable from './mixins/Observable'
import {
  RECORDER_INITIALIZED,
  MEDIA_STREAM_SOURCE_CREATED,
  STARTED_RECORDING,
  STOPPED_RECORDING,
  REMOVE,
  RESET,
  UNSUPPORTED,
  recorderWrapper,
  handlerFor,
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
const onUnsupported = handlerFor(UNSUPPORTED)

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

    const Adapter = findAdapter(adapterName)

    if (!Adapter) {
      window.setTimeout(() => {
        this.notifyObservers(onUnsupported)
      })
      return
    }

    const adapter = new Adapter().addObserver(this, relay)

    this[withAdapter] = recorderWrapper(adapter)

    Observable.call(this)
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
    this[withAdapter]('startRecording')
  }

  stopRecording() {
    this[withAdapter]('stopRecording')
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
