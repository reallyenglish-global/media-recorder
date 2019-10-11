var _ = require('underscore')
var Observable = require('../mixins/Observable')
var STOPPED = 1
var PLAYING = 2
var RECORDING = 3

var MobileAdapter = function MobileAdapter(config) {
  this.initialize(config)
}
MobileAdapter.isSupported = () => {
  return !_.isEmpty(window.rels) && !_.isEmpty(window.rels.mobile)
}
MobileAdapter.prototype = {
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

  startRecording() {
    this.stopPlaying()
    this.recorder.startRecord()
    this._setState(RECORDING)
  },

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
Observable.call(MobileAdapter.prototype)
module.exports = MobileAdapter
