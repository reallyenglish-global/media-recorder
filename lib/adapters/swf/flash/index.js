/*
  eslint
  class-methods-use-this: ["error", { "exceptMethods": ["remove", "hide", "show", "isShowing"]}]
*/
import Observable from '../../../mixins/Observable'
import swfobject from '../better.swfobject'
import { onRecorderStarted, onRecorderStopped, onRecorderInitialized } from '../../../constants'

const SHOCKWAVE_FLASH_AX = 'ShockwaveFlash.ShockwaveFlash'
const FLASH_MIME_TYPE = 'application/x-shockwave-flash'
const MAGICAL_SWF_OBJECT_INDEX = 3
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

  getRecorder() {
    if (!this.swfObject) {
      return null
    }
    if (this.swfObject.recordStart) {
      return this.swfObject
    }
    if (
      this.swfObject.children[MAGICAL_SWF_OBJECT_INDEX] &&
      this.swfObject.children[MAGICAL_SWF_OBJECT_INDEX].recordStart
    ) {
      return this.swfObject.children[MAGICAL_SWF_OBJECT_INDEX]
    }
    return undefined
  }

  isShowing() {
    return Flash.container().style.left !== '-9999px'
  }

  remove() {
    const container = Flash.container()
    container && document.body.removeChild(container)
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

  /* PRAGMA - incoming from flash object */

  initialized() {
    this.isInitialized = true
    this.hide()
    this.notifyObservers(onRecorderInitialized, this.getRecorder())
  }

  microphoneMuted() {
    this.show()
  }

  recordStart() {
    this.notifyObservers(onRecorderStarted)
  }

  stop() {
    console.log('got stop', this)
    this.notifyObservers(onRecorderStopped)
  }

  record() {
    this.hide()
    this.notifyObservers(onRecorderStarted)
  }

  triggerEvent(eventName, ...rest) {
    console.log('flash calling ', eventName)
    if (typeof this[eventName] === 'function') {
      return this[eventName](...rest)
    }

    // eslint-disable-next-line no-console
    return console.log('unsupported flash event triggered', eventName)
  }
}

export default Flash
