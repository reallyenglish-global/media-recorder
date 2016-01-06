'use strict'

var _ = require('underscore'),
    adapters = require('./adapters');

var Recorder = function(config) {
  this.initialize(config);
};

_.extend(Recorder.prototype, {
  initialize: function(config) {
    this.duration = null;

    if(this._clientSupportsNativeRecording()) {
      _.extend(this, adapters.recorderjs);
    }
    else {
      _.extend(this, adapters.flash);
    }
  },

  _clientSupportsNativeRecording: function() {
    var audioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
    var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
    
    return (typeof(audioContext) === 'function') || (typeof(getUserMedia) === 'function';
  },

  onEnded: function() {
    if (this.ended) {
      this.ended.call(this);
    }
  }
});

module.exports = Recorder;
