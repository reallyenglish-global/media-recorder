/*
  eslint
  class-methods-use-this: ["error", { "exceptMethods": ["remove", "hide", "show", "isShowing"]}]
*/
import Observable from '../../../mixins/Observable'
import swfobject from '../better.swfobject'
import { onRecorderStarted, onRecorderInitialized } from '../../../constants'

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
    return document.getElementById(CONTAINER_ID)
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
      async (event) => {
        if (event.success) {
          this.swfObject = event.ref
          const initialized = await window.setTimeout(() => {
            return this.initialized
          }, 800)
          // is this waiting for permissions, or what?
          // if, for whatever reason, we did not get the initialized
          // event show the flash because....?....
          initialized || this.show()
        } else {
          this.showFlashRequired()
        }
      },
    )
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
    this.initialized = true
    this.isShowing() && this.hide()
    this.notifyObservers(onRecorderInitialized, this.getRecorder())
  }

  microphoneMuted() {
    this.show()
  }

  record() {
    this.notifyObservers(onRecorderStarted)
  }

  triggerEvent(eventName, ...rest) {
    if (typeof this[eventName] === 'function') {
      return this[eventName](...rest)
    }

    // eslint-disable-next-line no-console
    return console.log('unsupported flash event triggered', eventName)
  }
}

export default Flash
