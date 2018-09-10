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
    window.OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext

    audioContext = audioContext || new window.AudioContext();
  },

  startRecording: function() {
    var self = this
    this.ensureRecorder().then(function(recorder) {
      self.recorder = recorder
      recorder.record()
      self.notifyObservers('onStartedRecording', audioContext);
    });
  },

  ensureRecorder: function() {
    var d = $.Deferred();
    var self = this
    _.delay(function() {
      self.notifyObservers('onRecorderInitialized', audioContext);
      navigator.mediaDevices.getUserMedia({audio: true}).then(function(stream) {
        var sourceStream =  audioContext.createMediaStreamSource(stream);
        self.notifyObservers('onMediaStreamSourceCreated', sourceStream);
        d.resolve(new RecorderJs(sourceStream));
      }, function(e) {
        console.log('RecorderCore#No live audio input: ' + e);
        d.reject(e);
      });
    }, 0);
    return d;
  },

  startPlaying: function() {
    AudioProcessors.Buffer.configure({
      recorder: this.recorder,
      sampleRate: audioContext.sampleRate
    }).process().then(_.bind(function(audioBuffer) {
      var source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.onended = _.bind(function() {
        this.notifyObservers('onStoppedPlaying')
        delete this.source
      }, this)
      this.source  = source
      source.start(0)
      this.notifyObservers('onStartedPlaying');
    }, this))
  },

  stopRecording: function() {
    if(this.recorder) {
      this.recorder.stop()
      AudioProcessors.Buffer.configure({
        recorder: this.recorder,
        sampleRate: audioContext.sampleRate
      }).process()
      .then(AudioProcessors.Resample.configure({
        numChannels: 2,
        sampleRate: window.webkitAudioContext ? 44100 : 16000,
      }).process)
      .then(_.bind(function(audioBuffer) {
        this.notifyObservers('onStoppedRecording', audioBuffer.getChannelData(0))
      }, this))
    }
  },

  stopPlaying: function() {
    this.source && this.source.stop();
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
    if(this.source) {
      this.source.onended = function() { /* noop */ }
    }

    this.source && this.source.stop()
    this.recorder && this.recorder.stop()

    delete this.recording
    delete this.recorder
    delete this.source
  },
};

Observable.call(RecorderJsAdapter.prototype);
module.exports = RecorderJsAdapter;
