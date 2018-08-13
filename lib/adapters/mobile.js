'use strict';

var _ = require('underscore');
var Observable = require('../mixins/Observable');

var STOPPED = 1,
    PLAYING = 2,
    RECORDING = 3

var MobileAdapter = function(config) {
  this.initialize(config);
};

MobileAdapter.isSupported = function() {
  return !_.isEmpty(window.rels) && !_.isEmpty(window.rels.mobile);
};

MobileAdapter.prototype = {

  initialize: function(){
    this.Recorder = window.rels.mobile.recorder;

    this.state = STOPPED;

    this.recorder = new this.Recorder();
    this.recorder.addObserver(this, ['error', 'playback-ended', 'recording-stopped']);
  },

  startRecording: function() {
    this.stopPlaying();

    this.recorder.startRecord();
    this._setState(RECORDING);

    this.notifyObservers('onStartedRecording');
  },

  stopRecording: function() {
    if(this.state === RECORDING) {
      this.notifyObservers('onStoppedRecording');
      this.stop()
      this._setState(STOPPED);
    }
  },

  startPlaying: function() {
    this.recorder.play();
    this._setState(PLAYING);
  },

  stopPlaying: function() {
    if(this.state === PLAYING) {
      this.stop()
      this._onStoppedPlaying();
    }
  },

  remove: function() {
    this.reset();
    this.recorder.release();
    delete this.recorder;
    this.removeObservers();
  },

  stop: function() {
    this.state === PLAYING && this.recorder.stop();
    this.state === RECORDING && this.recorder.stopRecord();
  },

  reset: function() {
    if(this.recorder) {
      this.stop();
      this.state = STOPPED;
    }
  },

  onError: function(e) {
    // TODO something sensible here...
  },

  onRecordingStopped: function(data) {
    if(this.state !== STOPPED) {
      this._setState(STOPPED);
      this.notifyObservers('onStoppedRecording', data);
    }
  },

  onPlaybackEnded: function() {
    this.state === PLAYING && this._onStoppedPlaying();
  },

  _onStoppedPlaying: function() {
    this._setState(STOPPED);
    this.notifyObservers('onStoppedPlaying');
  },

  _setState: function(state) {
    this.state = state;
  }
};

Observable.call(MobileAdapter.prototype);
module.exports = MobileAdapter;
