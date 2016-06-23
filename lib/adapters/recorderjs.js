'use strict';

var _ = require('underscore');
var observable = require('../observable');
var RecorderJs = require('recorderjs');
var AudioContext = require('./compat/AudioContext');

// @note +getUserMedia+ *must* be invoked via +navigator+ or it will raise an 'Illegal invocation' exception
navigator.getUserMedia = require('./compat/getUserMedia');

var RecorderJsAdapter = function(config) {
  this.initialize(config);
};

RecorderJsAdapter.isSupported = function() {
  var audioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
  var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

  return ((typeof(audioContext) === 'function') && (typeof(getUserMedia) === 'function')) && (window.location.protocol === 'https:');
};

_.extend(RecorderJsAdapter.prototype, observable, {

  initialize: function(){
    this.audioContext = new AudioContext();
    navigator.getUserMedia({audio: true}, _.bind(this._onUserMediaReady, this), _.bind(this._onUserMediaError, this));
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

  // Resets the recording, releases observers & closes the audio context (if supported by browser)
  remove: function() {
    this.reset();
    this.audioContext.close().catch(this._audioContextError);
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
    var streamSource = this.audioContext.createMediaStreamSource(stream);
    this.recorder = new RecorderJs(streamSource);
  },

  _onUserMediaError: function(e) {
    console.log('RecorderCore#No live audio input: ' + e);
    throw new Error('Failed to load adapter');
  },

  _onPlaybackBufferReady: function(buffers) {
    var newBuffer = this.audioContext.createBuffer( 2, buffers[0].length, this.audioContext.sampleRate );
    newBuffer.getChannelData(0).set(buffers[0]);
    newBuffer.getChannelData(1).set(buffers[1]);

    this.player = this.audioContext.createBufferSource();
    this.player.buffer = newBuffer;
    this.player.onended = _.bind(function() { this.notifyObservers('onStoppedPlaying'); }, this);
    this.player.connect(this.audioContext.destination);
    this.player.start(0);
  }
});

module.exports = RecorderJsAdapter;

