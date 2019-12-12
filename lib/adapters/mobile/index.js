import { MOBILE } from '../../constants'

var _ = require('underscore')
var Observable = require('../../mixins/Observable')
var STOPPED = 1
var PLAYING = 2
var RECORDING = 3

const Mobile = function Mobile(config) {
  this.initialize(config)
}

Mobile.isSupported = () => {
  return !_.isEmpty(window.rels) && !_.isEmpty(window.rels.mobile)
}

Mobile.prototype = {
  initialize() {
    this.Recorder = window.rels.mobile.recorder
    this.state = STOPPED
    this.recorder = new this.Recorder()
    this.recorder.addObserver(this, [
      'error',
      'playback-ended',
      'recording-stopped',
      'recording-started',
    ])
  },

  isAllowed() {
    return true
  },

  startRecording() {
    this.stopPlaying()
    this.recorder.startRecord()
    this._setState(RECORDING)
  },

  name: MOBILE,

  stopRecording() {
    if (this.state === RECORDING) {
      this.stop()
    }
  },

  startPlaying() {
    this.recorder.play()
    this._setState(PLAYING)
  },

  stopPlaying() {
    if (this.state === PLAYING) {
      this.stop()
      this._onStoppedPlaying()
    }
  },

  remove() {
    this.reset()
    this.recorder.release()
    delete this.recorder
    this.removeObservers()
  },

  stop() {
    this.state === PLAYING && this.recorder.stop()
    this.state === RECORDING && this.recorder.stopRecord()
  },

  reset() {
    if (this.recorder) {
      this.stop()
      this.state = STOPPED
    }
  },

  onError() {
    // TODO something sensible here...
  },

  onRecordingStopped(data) {
    if (this.state !== STOPPED) {
      this._setState(STOPPED)
      this.notifyObservers('onStoppedRecording', data)
    }
  },

  onRecordingStarted() {
    this.notifyObservers('onStartedRecording')
  },

  onPlaybackEnded() {
    this.state === PLAYING && this._onStoppedPlaying()
  },

  _onStoppedPlaying() {
    this._setState(STOPPED)
    this.notifyObservers('onStoppedPlaying')
  },

  _setState(state) {
    this.state = state
  },
}
Observable.call(Mobile.prototype)
export default Mobile
