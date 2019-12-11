import adapters from './adapters/'
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

/*
 * Initialize a recording object
 *
 * @param {Object} [options]
 * @param {String} [options.swfPath] Path to the fallback SWF file
 *
 */
class Recorder {
  constructor({ adapterName, swfPath }) {
    let Adapter

    if (adapterName) {
      Adapter = adapters[adapterName]
    } else {
      Adapter = Object.values(adapters).find((candidate) => candidate.isSupported())
    }

    if (!Adapter) {
      window.setTimeout(() => {
        this.notifyObservers(onUnsupported)
      })
      return
    }

    const adapter = new Adapter({ swfPath }).addObserver(this, relay)

    this[withAdapter] = (method, ...rest) => {
      if (!adapter) {
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

    this.relay = relay
    Observable.call(this)
  }

  [withAdapter](method) {
    this.last = method
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

  startPlaying() {
    this[withAdapter]('startPlaying')
  }

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
