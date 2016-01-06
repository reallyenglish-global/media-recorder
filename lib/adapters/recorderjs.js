'use strict';

var _ = require('underscore');
var Recorder = require('recorderjs');

function shimAudio(){
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

  if (!window.AudioContext) { throw new Error('WebAudio IS NOT SUPPORTED!!'); }
  if (!navigator.getUserMedia) { throw new Error('Navigator.getUserMedia IS NOT SUPPORTED!!'); }
}

module.exports = {

  audioContext: undefined,

  recorder: undefined,

  player: undefined,
  onReady: function() {
    console.log('onReady');
  },

  initialize: function(){
  console.log('initialize');
    shimAudio();
    this.audioContext = new window.AudioContext();

    navigator.getUserMedia({audio: true}, _.bind(function(stream){
      var input = this.audioContext.createMediaStreamSource(stream);
      this.recorder = new Recorder(input);
      this.onReady();
    }, this), function(e) {
      console.log('RecorderCore#No live audio input: ' + e);
    });
  },

  startRecording: function() {
    this.recorder && this.recorder.clear();
    this.recorder && this.recorder.record();
    this.recording = true;
  },

  stopRecording: function() {
    this.recorder && this.recorder.stop();
    this.recording = false;
  },

  isRecording: function(){
    return this.recording === true;
  },

  remove: function() {
    this.reset();
    this.audioContext && this.audioContext.close();
  },

  reset: function() {
    this.player && (this.player.onended = undefined);
    this.stopRecording();
    this.stopPlaying();
    this.recorder && this.recorder.clear();
    delete this.player;
  },

  startPlayback: function() {
    var getBufferCallback = _.bind(function( buffers ) {
      var newBuffer = this.audioContext.createBuffer( 2, buffers[0].length, this.audioContext.sampleRate );
      newBuffer.getChannelData(0).set(buffers[0]);
      newBuffer.getChannelData(1).set(buffers[1]);

      this.player = this.audioContext.createBufferSource();
      this.player.buffer = newBuffer;
      this.player.onended = this.onPlaybackEnded;
      this.player.connect( this.audioContext.destination );
      this.player.start(0);
    }, this);

    this.recorder.getBuffer(getBufferCallback);
  },

  stopPlaying: function() {
    this.player && this.player.stop();
  },

  canPlay: function(){
    return typeof this.player !== 'undefined' && this.player !== null;
  }
};

