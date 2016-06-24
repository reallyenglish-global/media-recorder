'use strict'

var _ = require('underscore');
var adapters = require('./adapters');
var Observable = require('./mixins/Observable');

var Adapter = _.find(adapters, function(adapter) {
  return adapter.isSupported();
});

Adapter = Adapter || adapters.swf;


/*
 * Initialize a recording object
 *
 * @param {Object} [options]
 * @param {String} [options.swfPath] Path to the fallback SWF file
 *
*/
var Recorder = function(options) {
  this.initialize(options);
};

Recorder.prototype = {

  relay: [
    'stopped:playing',
    'started:recording'
  ],

  initialize: function(options) {
    this.adapter = new Adapter(options)
    .addObserver(this,[
      'started:recording',
      'stopped:playing'
    ]);
  },

  startRecording: function() {
    this.adapter.startRecording();
  },

  stopRecording: function() {
    this.adapter.stopRecording();
  },

  startPlaying: function() {
    this.adapter.startPlaying();
  },

  stopPlaying: function() {
    this.adapter.stopPlaying();
  },

  reset: function() {
    this.adapter.reset();
  },

  remove: function() {
    this.adapter.remove();
    this.removeObservers();
  }
};

Observable.call(Recorder.prototype);
module.exports = Recorder;
