/* globals window, navigator, require, module, console */
'use strict';

var _ = require('underscore');
var $ = require('jquery');

var Observable = require('../mixins/Observable');
var RecorderJs = require('recorderjs');
require('webrtc-adapter');
var audioContext;


var RecorderJsAdapter = function(config) {
  this.initialize(config);
};

RecorderJsAdapter.isSupported = function() {
  // consider using browserDetails to specify exactly which browsers we are supporting here.
  return (navigator.mediaDevices && typeof(navigator.mediaDevices.getUserMedia) === 'function') && (window.location.protocol === 'https:');
};

RecorderJsAdapter.prototype = {

  initialize: function() {
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
  },

  startRecording: function() {
    this.ensureRecorder().then(_.bind(function(recorder) {
      this.stopRecording = function() {
        recorder.stop();
        recorder.getBuffer(_.bind(this._onRecorded, this));
        this.stopRecording = function() {};
      }

      recorder.record();
      this.notifyObservers('onStartedRecording');
    }, this));
  },

  ensureRecorder: function() {
    var d = $.Deferred();

    _.delay(function() {
      navigator.mediaDevices.getUserMedia({audio: true}).then(function(stream) {
        var sourceStream =  audioContext.createMediaStreamSource(stream);
        d.resolve(new RecorderJs(sourceStream), sourceStream);
      }, function(e) {
        console.log('RecorderCore#No live audio input: ' + e);
        d.reject(e);
      });
    }, 0);

    return d;
  },

  startPlaying: function() {
    var source = audioContext.createBufferSource();
    this.stopPlaying = function() {
      source.stop();
      this.notifyObservers('onStoppedPlaying');
      this.stopPlaying = function() {};
    }
    source.buffer = this.recording;
    source.connect(audioContext.destination);
    source.onended = _.bind(this.stopPlaying, this);
    source.start(0);
    this.notifyObservers('onStartedPlaying');
  },

  stopRecording: function() { /* noop until recording has started */ },
  stopPlaying: function() { /* noop until playback has started */ },

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
    this.recording = null;
    this.stopRecording();
    this.stopPlaying();
  },

  _onRecorded: function(buffers) {
    var buffer = audioContext.createBuffer(2, buffers[0].length, audioContext.sampleRate );
    buffer.getChannelData(0).set(buffers[0]);
    buffer.getChannelData(1).set(buffers[1]);
    this.recording = buffer;
    this.notifyObservers('onStoppedRecording');
  }
};

Observable.call(RecorderJsAdapter.prototype);
module.exports = RecorderJsAdapter;
