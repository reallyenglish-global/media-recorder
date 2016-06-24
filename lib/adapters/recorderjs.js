/* globals window, navigator, require, module, console */
'use strict';

var _ = require('underscore');
var Observable = require('../mixins/observable');
var RecorderJs = require('recorderjs');
var AudioContext = require('./compat/AudioContext');
require('webrtc-adapter');


var RecorderJsAdapter = function(config) {
  this.initialize(config);
};

RecorderJsAdapter.isSupported = function() {
  return (typeof(navigator.getUserMedia) === 'function') && (window.location.protocol === 'https:');
};

var recorder;

RecorderJsAdapter.prototype = {

  initialize: function() {
    navigator.mediaDevices.getUserMedia({audio: true}).then(function(stream) {
      var context = new AudioContext();
      recorder = new RecorderJs(context.createMediaStreamSource(stream));
    }, this._onUserMediaError);
  },

  startRecording: function() {
    recorder.record();
    this.notifyObservers('onStartedRecording');
  },

  startPlaying: function() {
    var context = new AudioContext();
    var source = context.createBufferSource();

    source.buffer = this.recording;
    source.connect(context.destination);

    this.stopPlaying = function() {
      source.stop();
      context.close();
      this.notifyObservers('onStoppedPlaying');
      this.stopPlaying = function() {};
    };

    source.onended = _.bind(this.stopPlaying, this);
    source.start(0);

    this.notifyObservers('onStartedPlaying');
  },

  stopRecording: function() {
    if(recorder) {
      recorder.stop();
      recorder.getBuffer(_.bind(this._onRecorded, this));
      recorder.clear();
      this.notifyObservers('onStoppedRecording');
    }
  },

  stopPlaying: function() { /* noop until playing has started */ },

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
    this.stopRecording();
    this.stopPlaying();
  },

  _onRecorded: function(data) {
    var context = new AudioContext()
    var recording = context.createBuffer(2, data[0].length, context.sampleRate );
    recording.getChannelData(0).set(data[0])
    recording.getChannelData(1).set(data[1])
    context.close();
    this.recording = recording;
  },


  _onUserMediaError: function(e) {
    console.log('RecorderCore#No live audio input: ' + e);
    throw new Error('Failed to load adapter');
  }
};
Observable.call(RecorderJsAdapter.prototype);
module.exports = RecorderJsAdapter;

