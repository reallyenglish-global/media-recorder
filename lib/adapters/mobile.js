'use strict';

var _ = require('underscore');
var Observable = require('../mixins/Observable');

var MobileAdapter = function(config) {
  this.initialize(config);
};

MobileAdapter.isSupported = function() {
  return !_.isEmpty(window.rels) && !_.isEmpty(window.rels.mobile);
};

MobileAdapter.prototype = {

  initialize: function(){
    this.Recorder = window.rels.mobile.recorder;

    this.recorder = new this.Recorder();
    this.recorder.addObserver(this, ['error', 'playback-ended']);
  },

  startRecording: function() {
    this.stopPlaying();
    this.stopRecording();

    this.recorder.startRecord();

    this.notifyObservers('onStartedRecording');
  },

  stopRecording: function() {
    this.recorder && this.recorder.stopRecord();
  },

  startPlaying: function() {
    this.recorder.play();
  },

  stopPlaying: function() {
    this.recorder && this.recorder.stop();
    this.notifyObservers('onStoppedPlaying');
  },

  remove: function() {
    this.reset();
    this.recorder.release();
    delete this.recorder;
    this.removeObservers();
  },

  reset: function() {
    if(this.recorder) {
      this.stopRecording();
      this.stopPlaying();
    }
  },

  onError: function(e) {
    // TODO something sensible here...
  },

  onPlaybackEnded: function() {
    this.notifyObservers('onStoppedPlaying');
  }
};

Observable.call(MobileAdapter.prototype);
module.exports = MobileAdapter;

