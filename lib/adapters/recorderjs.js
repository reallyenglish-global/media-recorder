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

RecorderJsAdapter.prototype = {

  initialize: function() {
    navigator.mediaDevices.getUserMedia({audio: true}).then(function() {}, function(){});
  },

  startRecording: function() {
    var success = _.bind(function(stream) {


      var context = new AudioContext();
      var recorder = new RecorderJs(context.createMediaStreamSource(stream));

      this.stopRecording = function() {
        recorder.stop();
        recorder.getBuffer(_.bind(this._onRecorded, this));
        recorder.clear();
        // context.close && context.close();
        context.close();
        this.notifyObservers('onStoppedRecording');
        this.stopRecording = function() {};
      };
      recorder.record();
      this.notifyObservers('onStartedRecording');
    }, this);

    navigator.mediaDevices.getUserMedia({audio: true}).then(success, this._onUserMediaError);
  },

  startPlaying: function() {
    var context = new AudioContext();
    var source = context.createBufferSource();

    source.buffer = this.recording;
    source.connect(context.destination);

    this.stopPlaying = function() {
      source.stop();
      //context.close && context.close();
      context.close();
      this.notifyObservers('onStoppedPlaying');
      this.stopPlaying = function() {};
    };

    source.onended = _.bind(this.stopPlaying, this);
    source.start(0);

    this.notifyObservers('onStartedPlaying');
  },

  stopRecording: function() { /* noop until recording has started */ },

  stopPlaying: function() { /* noop until playing has started */ },

  // Resets the recording, releases observers & closes the audio context (if supported by browser)
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
    this.stopRecording();
    this.stopPlaying();
  },

  _onRecorded: function(data) {
    var context = new AudioContext()
    var recording = context.createBuffer(2, data[0].length, context.sampleRate );
    recording.getChannelData(0).set(data[0])
    recording.getChannelData(1).set(data[1])
    this.recording = recording;
    // context.close && context.close();
    context.close()
  },


  _onUserMediaError: function(e) {
    console.log('RecorderCore#No live audio input: ' + e);
    throw new Error('Failed to load adapter');
  }
};
Observable.call(RecorderJsAdapter.prototype);
module.exports = RecorderJsAdapter;

