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
 * @param {String} [config.swfPath] Path to the fallback SWF file
 *
*/
var Recorder = function(config) {
  config = config || {};

  var Adapter;

  switch(typeof config.adapter) {
    case 'string':
      Adapter = adapters[config.adapter];
      break;
    case 'function':
      Adapter = config.adapter;
      break;
    default:
      Adapter = this._defaultAdapterForClient();
      break;
  }

  this.adapter = new Adapter(config);

  this.initialize();
};

_.extend(Recorder.prototype, observable, {
  initialize: function() {
    this._setupAdapterRelay();
    this.adapter.addObserver(this);
  },

  _setupAdapterRelay: function() {
    var functions = ['startRecording', 'stopRecording', 'startPlaying', 'stopPlaying', 'reset'];
    var self = this;

    _.each(functions, function(name) {
      self[name] = _.bind(self.adapter[name], self.adapter);
    });

    var events = ['onStoppedPlaying', 'onStartedRecording'];

    _.each(events, function(name) {
      self[name] = _.bind(self.notifyObservers, self, name);
    });
  },

  _defaultAdapterForClient: function() {
    return this._clientSupportsNativeRecording() ? adapters.recorderjs : adapters.swf;
  },

  _clientSupportsNativeRecording: function() {
    var audioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
    var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
    
    return ((typeof(audioContext) === 'function') || (typeof(getUserMedia) === 'function')) && (window.location.protocol === 'https:');
  },
  
  remove: function() {
    this.adapter.remove();
    this.removeObservers();
  }
});

module.exports = Recorder;
