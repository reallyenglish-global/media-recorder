'use strict';

var _ = require('underscore');
var observable = require('../observable');

var Recorder;

var MobileAdapter = function(config) {
  this.initialize(config);
};

MobileAdapter.isSupported = function() {
  return !_.isEmpty(window.rels) && !_.isEmpty(window.rels.mobile); 
};

_.extend(MobileAdapter.prototype, observable, {

  initialize: function(){
    Recorder = window.rels.mobile.recorder;

    this.recorder = new Recorder();
  },

  startRecording: function() {
    this.stopPlaying();
    this.stopRecording();

    this.recorder.clear();
    this.recorder.record();

    this.notifyObservers('onStartedRecording');
  },

  stopRecording: function() {
    this.recorder && this.recorder.stop();
  },

  startPlaying: function() {
    this.recorder.getBuffer(_.bind(this._onPlaybackBufferReady, this));
  },

  stopPlaying: function() {
    this.player && this.player.stop();
  },

  remove: function() {
    this.reset();
    this.removeObservers();
  },

  _audioContextError: function(e) {
    switch(e.name) {
      case 'InvalidStateError':
        break;
      default:
        throw e;
    }
  },

  reset: function() {
    this.player && (this.player.onended = undefined);
    this.stopRecording();
    this.recorder && this.recorder.clear();
    this.stopPlaying();
    delete this.player;
  },

  _onUserMediaReady: function(stream) {
  },

  _onUserMediaError: function(e) {
    console.log('RecorderCore#No live audio input: ' + e);
    throw new Error('Failed to load adapter');
  },
});

module.exports = MobileAdapter;

