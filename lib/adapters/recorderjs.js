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

_.extend(RecorderJsAdapter.prototype, observable, {

  initialize: function(){
    this.audioContext = new AudioContext();
  },

  startRecording: function() {
    this.stopPlaying();
    this.stopRecording();
    this.recorder && this.recorder.clear();

    navigator.getUserMedia({audio: true}, _.bind(function(stream){
      var streamSource = this.audioContext.createMediaStreamSource(stream);
      this._onStreamSourceReady(streamSource);
    }, this), function(e) {
      console.log('RecorderCore#No live audio input: ' + e);
      throw new Error('Failed to load adapter');
    });
  },

  stopRecording: function() {
    this.recorder && this.recorder.stop();
  },

  startPlaying: function() {
    var self = this;

    var getBufferCallback = function( buffers ) {
      var newBuffer = self.audioContext.createBuffer( 2, buffers[0].length, self.audioContext.sampleRate );
      newBuffer.getChannelData(0).set(buffers[0]);
      newBuffer.getChannelData(1).set(buffers[1]);

      self.player = self.audioContext.createBufferSource();
      self.player.buffer = newBuffer;
      self.player.onended = function() { self.notifyObservers('onStoppedPlaying'); }
      self.player.connect(self.audioContext.destination);
      self.player.start(0);
    };

    this.recorder.getBuffer(getBufferCallback);
  },

  stopPlaying: function() {
    this.player && this.player.stop();
  },

  remove: function() {
    if(this.audioContext) {
      this.reset();
      this.audioContext.close();
    }

    this.removeObservers();
  },

  reset: function() {
    this.player && (this.player.onended = undefined);
    this.stopRecording();
    this.recorder && this.recorder.clear();
    this.stopPlaying();
    delete this.player;
  },

  _onStreamSourceReady: function(streamSource) {
    this.recorder = new RecorderJs(streamSource);
    this.recorder.record();
    this.notifyObservers('onStartedRecording');
  }
});

module.exports = RecorderJsAdapter;

