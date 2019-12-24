/*
  eslint
  class-methods-use-this: ["error", { "exceptMethods": ["remove", "hide", "show", "isShowing"]}]
*/
import Observable from '../../../mixins/Observable'
import swfobject from './better.swfobject'
import base64Decoder from './base64Decoder'
import {
  onReset,
  onRemove,
  onStartRecording,
  onStopRecording,
  onRecorderStarted,
  onRecorderStopped,
  onRecorderInitialized,
  MIME_WAV,
  MIME_MPEG,
} from '../../../constants'

const SHOCKWAVE_FLASH_AX = 'ShockwaveFlash.ShockwaveFlash'
const FLASH_MIME_TYPE = 'application/x-shockwave-flash'
const CONTAINER_ID = 'recorderFlashContainer'

class Flash {
  constructor() {
    Observable.call(this)
    this.injectFlash()
  }

  static isSupported() {
    try {
      if (new window.ActiveXObject(SHOCKWAVE_FLASH_AX)) {
        return true
      }
    } catch (e) {
      return (
        navigator.mimeTypes &&
        navigator.mimeTypes[FLASH_MIME_TYPE] !== undefined &&
        navigator.mimeTypes[FLASH_MIME_TYPE].enabledPlugin
      )
    }
    return false
  }

  static container() {
    const el = document.getElementById(CONTAINER_ID)
    return el
  }

  injectFlash() {
    window.flashRecorder = this
    const fv = { recorderInstance: 'window.flashRecorder' }
    const container = document.createElement('div')
    const flashElement = document.createElement('div')

    flashElement.setAttribute('id', 'recorderFlashObject')
    container.setAttribute('id', CONTAINER_ID)
    container.setAttribute('style', 'position: fixed; width: 230px; height: 140px;')

    document.body.appendChild(container)
    container.appendChild(flashElement)
    this.hide()

    swfobject.embedSWF(
      'recorder.swf',
      flashElement,
      '231',
      '141',
      '10.1.0',
      undefined,
      fv,
      { allowscriptaccess: 'always' },
      undefined,
      this.embedCallback.bind(this),
    )
  }

  async embedCallback(event) {
    if (event.success) {
      this.swfObject = event.ref
      const ready = await this.loadCheck()
      ready || this.show() // hopefully showing permissions dialog
    } else {
      this.showFlashRequired()
    }
  }

  loadCheck() {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        resolve(this.isInitialized)
      }, 800)
    })
  }

  isShowing() {
    return Flash.container().style.left !== '-9999px'
  }

  remove() {
    const container = Flash.container()
    container && document.body.removeChild(container)
    this.removeObservers()
  }

  show() {
    const container = Flash.container()
    const width = window.innerWidth || document.body.offsetWidth
    const height = window.innerHeight || document.body.offsetHeight

    const left = width / 2 - 115 + 'px'
    const top = height / 2 - 70 + 'px'

    container.style.left = left
    container.style.top = top
  }

  hide() {
    const container = Flash.container()
    container.style.left = '-9999px'
    container.style.top = '-9999px'
  }

  showFlashRequired() {
    const container = Flash.container()
    container.innerHTML =
      "<p>Adobe Flash Player 10.1 or newer is required to use this feature.</p><p><a href='http://get.adobe.com/flashplayer' target='_top'>Get it on Adobe.com.</a></p>"
    container.style.color = 'white'
    container.style.backgroundColor = '#777'
    container.style.textAlign = 'center'
    this.show()
  }

  /* PRAGMA - incoming from adapter */

  [onStartRecording]() {
    this.swfObject.recordStart()
  }

  [onStopRecording]() {
    const duration = this.swfObject.recordStop()
    // NOTE FLASH will crash if the recording is too short.
    duration >= 1000 ? this.getAudioData() : this.notifyObservers(onRecorderStopped, null)
  }

  [onReset]() {
    this.swfObject.recordStop()
  }

  [onRemove]() {
    this.remove()
  }

  /* PRAGMA - incoming from flash object */

  initialized() {
    this.isInitialized = true
    this.hide()
    this.notifyObservers(onRecorderInitialized)
  }

  microphoneMuted() {
    this.show()
  }

  record() {
    this.hide()
    this.notifyObservers(onRecorderStarted)
  }

  triggerEvent(eventName, ...rest) {
    if (typeof this[eventName] === 'function') {
      this[eventName](...rest)
    }
  }

  /* PRAGMA - internal functions for audio retrieval from flash */

  getAudioData() {
    const encodings = {
      [MIME_WAV]: 'wavData',
      [MIME_MPEG]: 'mp3Data',
    }

    const audio = document.createElement('audio')
    const mime = Object.keys(encodings).find((encoding) => {
      return audio.canPlayType(encoding)
    })

    this[encodings[mime]]()
  }

  audioProcessor(predicate, mime) {
    return (data) => {
      if (!data) {
        predicate()
        return
      }

      const buffer = base64Decoder(data)
      const audio = new Blob([buffer], { type: mime })

      this.notifyObservers(onRecorderStopped, audio)
    }
  }

  // NOTE: mp3Data is an async method on the flash external interface
  // that will trigger an mp3Data event when it is done.

  mp3Data(data) {
    this.audioProcessor(() => {
      this.swfObject.mp3Data()
    }, MIME_MPEG)(data)
  }

  // NOTE: Unlike mp3Data, wavData is sycnronous and does not
  // trigger any event.

  wavData(data) {
    this.audioProcessor(() => {
      const base64 = this.swfObject.wavData()
      this.wavData(base64)
    }, MIME_WAV)(data)
  }
}

export default Flash
