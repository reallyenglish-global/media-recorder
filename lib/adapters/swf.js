var swfobject = require('./swf/better.swfobject')
var _ = require('underscore')
var Observable = require('../mixins/Observable')
var SwfAdapter = function SwfAdapter(config) {
  this.initialize(config)
}
SwfAdapter.isSupported = () => {
  try {
    if (new window.ActiveXObject('ShockwaveFlash.ShockwaveFlash')) {
      return true
    }
  } catch (e) {
    return (
      navigator.mimeTypes &&
      navigator.mimeTypes['application/x-shockwave-flash'] !== undefined &&
      navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin
    )
  }
  return false
}

const MAGICAL_SWF_OBJECT_INDEX = 3
SwfAdapter.prototype = {
  swfSource: 'recorder.swf',

  initialize(config) {
    // global handler for Flash
    window.flashRecorder = this
    this._events = []
    this._initialized = false
    this._recording = false
    this._playing = false
    if (config.swfPath) {
      this.swfSource = config.swfPath
    }

    this._setupFlashContainer()
    this._loadFlash()
    this.bind('initialized', this._onInitialized)
    this.bind('mp3Data', this._onDataReady)
    this.bind('ended', this._onEnded)
    this.bind('microphoneMuted', this._showFlash)
    this.bind('record', this._onStartedRecording)
  },

  startRecording() {
    this.flashInterface() && this.flashInterface().recordStart()
  },

  stopRecording() {
    if (this._recording) {
      this._recording = false
      this.flashInterface().recordStop() / 1000
      this.notifyObservers('onStoppedRecording')
    }
  },

  startPlaying() {
    this.flashInterface() && this.flashInterface().playback()
    this._playing = true
  },

  stopPlaying() {
    if (this._playing) {
      this.flashInterface() && this.flashInterface().playPause()
      this._onEnded()
    }
  },

  reset() {},

  remove() {
    this.flashInterface = null
    // Do not assume the element is still in the DOM
    // when it is not in the dom you get:
    // Uncaught NotFoundError: Failed to execute 'removeChild' on 'Node':
    // The node to be removed is not a child of this node.
    if (document.getElementById(this.flashContainer.id)) {
      document.body.removeChild(this.flashContainer)
    }
    this.removeObservers()
  },

  _onStartedRecording() {
    this._hideFlash()
    this._recording = true
    this.notifyObservers('onStartedRecording')
  },

  _setupFlashContainer() {
    this.flashContainer = document.createElement('div')
    this.flashContainer.setAttribute('id', 'recorderFlashContainer')
    this.flashContainer.setAttribute(
      'style',
      'position: fixed; left: -9999px; top: -9999px; width: 230px; height: 140px;',
    )
    document.body.appendChild(this.flashContainer)
  },

  _checkForFlashBlock() {
    window.setTimeout(
      _.bind(function check() {
        if (!this._initialized) {
          this._flashBlockCatched = true
          this._showFlash()
        }
      }, this),
      800,
    )
  },

  _onInitialized() {
    this._initialized = true
    if (this._flashBlockCatched) {
      this._hideFlash()
    }
  },

  _onDataReady(e) {
    this._callbackDataReady.call(this, e)
  },

  _showFlashRequiredDialog() {
    this.flashContainer.innerHTML =
      "<p>Adobe Flash Player 10.1 or newer is required to use this feature.</p><p><a href='http://get.adobe.com/flashplayer' target='_top'>Get it on Adobe.com.</a></p>"
    this.flashContainer.style.color = 'white'
    this.flashContainer.style.backgroundColor = '#777'
    this.flashContainer.style.textAlign = 'center'
    this._showFlash()
  },

  _loadFlash() {
    var flashElement = document.createElement('div')
    var fv = { recorderInstance: 'window.flashRecorder' }
    flashElement.setAttribute('id', 'recorderFlashObject')
    this.flashContainer.appendChild(flashElement)

    swfobject.embedSWF(
      this.swfSource,
      flashElement,
      '231',
      '141',
      '10.1.0',
      undefined,
      fv,
      { allowscriptaccess: 'always' },
      undefined,
      _.bind(this._flashLoaded, this),
    )
  },

  _flashLoaded(e) {
    if (e.success) {
      this.swfObject = e.ref
      this._checkForFlashBlock()
    } else {
      this._showFlashRequiredDialog()
    }
  },

  _showFlash() {
    this.flashContainer.style.left =
      (window.innerWidth || document.body.offsetWidth) / 2 - 115 + 'px'
    this.flashContainer.style.top =
      (window.innerHeight || document.body.offsetHeight) / 2 - 70 + 'px'
  },

  _hideFlash() {
    this.flashContainer.style.left = '-9999px'
    this.flashContainer.style.top = '-9999px'
  },

  flashInterface() {
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
  },

  bind(eventName, fn) {
    if (!this._events[eventName]) {
      this._events[eventName] = []
    }
    this._events[eventName].push(fn)
  },

  triggerEvent(eventName, arg0, arg1) {
    if (!this._events[eventName]) {
      return
    }
    for (let i = 0, len = this._events[eventName].length; i < len; i++) {
      if (this._events[eventName][i]) {
        this._events[eventName][i].apply(this, [arg0, arg1])
      }
    }
  },

  _onEnded() {
    this.notifyObservers('onStoppedPlaying')
    this._playing = false
  },
}
Observable.call(SwfAdapter.prototype)
module.exports = SwfAdapter
