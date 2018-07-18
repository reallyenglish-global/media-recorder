/* globals window, navigator, require, module, console */
'use strict';

var _ = require('underscore');
var $ = require('jquery');

var Observable = require('../mixins/Observable');
var RecorderJs = require('../recorderjs/recorder');
require('webrtc-adapter');
var audioContext;

var AudioProcessors = require('../processors/')

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
    var self = this
    this.ensureRecorder().then(function(recorder) {
      self.recorder = recorder
      recorder.record()
    });
    this.notifyObservers('onStartedRecording');
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
    source.onended = _.bind(this.stopPlaying, this)
    this.source  = source

    source.start(0)
    this.notifyObservers('onStartedPlaying');
  },

  stopRecording: function() {
    AudioProcessors.Buffer.configure({
      recorder: this.recorder,
      sampleRate: audioContext.sampleRate
    }).process()
      .then(AudioProcessors.Resample.configure({
        sampleRate: 16000,
        numChannels: 2,
      }).process)
      .then(_.bind(function(buffer) {
        this.recording = buffer
        this.notifyObservers('onStoppedRecording', buffer)
      }, this))
  },

  stopPlaying: function() {
    this.source.stop();
    this.notifyObservers('onStoppedPlaying')
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
    this.recorder && this.recorder.stop()
    this.source && this.source.stop()
  },
};

Observable.call(RecorderJsAdapter.prototype);
module.exports = RecorderJsAdapter;
