define(function(require) {
  'use strict';
  var _ = require('underscore');

  var MediaRecorderAPI = function() {
    this.initialize.call(this);
  };

  _.extend(MediaRecorderAPI.prototype, {
    initialize: function(cfg) {
      navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia;
      this.data = [];
    },

    clear: function() {
      this.data = [];
    },

    onError: function() {
    },

    onDataAvailabe: function(e) {
      console.log("data available");
      this.data.push(e.data);
    },

    startRecording: function(stream) {
      this.data = [];
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = _.bind(this.onDataAvailabe, this);
      this.mediaRecorder.onerror = function(e){
        console.log('Error: ', e);
      };
      // parameter is number of milliseconds of data to return in a single Blob
      this.mediaRecorder.start(2000);
    },

    record: function(){
      navigator.getUserMedia({audio: true}, _.bind(this.startRecording, this), this.onError);
    },

    play: function(){
      this.audio = document.createElement('audio');
      var blob = new Blob(this.data, { type: "text/plain" });
      this.audio.src = window.URL.createObjectURL(blob);
      this.audio.play();
    },

    stop: function(){
      this.mediaRecorder.stop();
    }
  });

  return MediaRecorderAPI;
});
