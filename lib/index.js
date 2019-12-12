import { findAdapter } from './adapters/'
import Observable from './mixins/Observable'
import {
  RECORDER_INITIALIZED,
  MEDIA_STREAM_SOURCE_CREATED,
  STARTED_RECORDING,
  STOPPED_RECORDING,
  STOPPED_PLAYING,
  UNSUPPORTED,
  handlerFor,
} from './constants'

const relay = [
  RECORDER_INITIALIZED,
  MEDIA_STREAM_SOURCE_CREATED,
  STARTED_RECORDING,
  STOPPED_RECORDING,
  STOPPED_PLAYING,
  UNSUPPORTED,
]
export {
  WEB_AUDIO,
  MOBILE,
  SWF,
  MEDIA_STREAM_SOURCE_CREATED,
  RECORDER_INITIALIZED,
  STARTED_RECORDING,
  STOPPED_RECORDING,
  STOPPED_PLAYING,
  UNSUPPORTED,
} from './constants'

const withAdapter = Symbol('withAdapter')
const onUnsupported = handlerFor(UNSUPPORTED)

const adapterWrapper = (adapter) => (method, ...rest) => {
  if (adapter.isAllowed() === false && method !== 'name') {
    return undefined
  }
  const target = adapter[method]
  const type = typeof target

  switch (type) {
    case 'function':
      return target.call(adapter, ...rest)
    default:
      return target
  }
}
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

    this[withAdapter] = adapterWrapper(adapter)

    Observable.call(this)

    if (!adapter.isAllowed()) {
      window.setTimeout(() => {
        this.notifyObservers(onUnsupported)
      })
    }
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

  // remove post 2019.12 release
  startPlaying() {
    this[withAdapter]('startPlaying')
  }

  // remove post 2019.12 release
  stopPlaying() {
    this[withAdapter]('stopPlaying')
  }

  reset() {
    this[withAdapter]('reset')
  }

  remove() {
    this[withAdapter]('remove')
    this.removeObservers()
  }
}

Observable.call(Recorder.prototype)
export default Recorder
