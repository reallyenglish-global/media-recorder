'use strict'

var _ = require('underscore');
var adapters = require('./adapters');
var observable = require('./observable');

/* 
 * Initialize a recording object
 * 
 * @param {String} [adapter] Name of a supported adapter - defaults to best for browser support
 * Valid adapters are 'recorderjs' & 'swf'
 * @param {Object} [config]
 * @param {String} [config.swfSource='../swf/recorder.js'] Path to the fallback SWF file
 *
*/
var Recorder = function(config) {
  config = config || {};

  var Adapter = adapters[config.adapter] || this._defaultAdapterForClient();

  this.adapter = new Adapter(config);

  this.initialize();
};

_.extend(Recorder.prototype, observable, {
  initialize: function() {
    this._setupAdapterRelay();
    this.adapter.addObserver(this);
  },

  _setupAdapterRelay: function() {
    var functions = ['startRecording', 'stopRecording', 'startPlaying', 'stopPlaying'];
    var self = this;

    _.each(functions, function(name) {
      self[name] = function() {
        console.log(name);
        self.adapter[name]();
      }
    });

    var events = ['onStoppedPlaying', 'onReady'];

    _.each(events, function(name) {
      self[name] = function() { self.notifyObservers(name); }
    });
  },

  _defaultAdapterForClient: function() {
    return this._clientSupportsNativeRecording() ? adapters.recorderjs : adapters.swf;
  },

  _clientSupportsNativeRecording: function() {
    var audioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
    var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
    
    return (typeof(audioContext) === 'function') || (typeof(getUserMedia) === 'function');
  },
  
  remove: function() {
    this.adapter.remove();
    this.removeObservers();
  }
});

module.exports = Recorder;
