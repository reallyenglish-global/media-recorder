/* globals window, navigator, require, module, console */
'use strict';

var _ = require('underscore');
var $ = require('jquery');

var Observable = require('../mixins/Observable');
var RecorderJs = require('../recorderjs/recorder');
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
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = audioContext || new window.AudioContext();
  },

  startRecording: function() {
    this.ensureRecorder().then(_.bind(function(recorder) {

      this.stopHandler(recorder, function(recorder) {
        recorder.getBuffer(_.bind(this._onRecorded, this));
      }).record();

      this.notifyObservers('onStartedRecording');
    }, this));
  },

  ensureRecorder: function() {
    var d = $.Deferred();

    _.delay(function() {
      navigator.mediaDevices.getUserMedia({audio: true}).then(function(stream) {
        var sourceStream =  audioContext.createMediaStreamSource(stream);
        d.resolve(new RecorderJs(sourceStream));
      }, function(e) {
        console.log('RecorderCore#No live audio input: ' + e);
        d.reject(e);
      });
    }, 0);
    return d;
  },

  startPlaying: function() {
    var source = audioContext.createBufferSource();

    source.buffer = this.recording;
    source.connect(audioContext.destination);

    this.stopHandler(source).start(0);
    this.notifyObservers('onStartedPlaying');
  },

  stop: function() {},

  stopRecording: function() {
    this.stop();
    this.notifyObservers('onStoppedRecording');
  },

  stopPlaying: function() {
    this.stop();
  },

  stopHandler: function(resource, postProcess) {

    this.stop = _.once(_.bind(function() {
      resource.stop();
      postProcess && postProcess.call(this, resource);
      var event = (resource instanceof RecorderJs) ? 'onStoppedRecording' : 'onStoppedPlaying';
      this.notifyObservers(event);
    }, this));

    resource.onended = this.stop;

    return resource;
  },

  // Resets the recording, releases observers
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
    this.recording = undefined;
    this.stop();
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
