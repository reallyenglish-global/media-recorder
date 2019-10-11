var _ = require('underscore')
var adapters = require('./adapters/')
var Observable = require('./mixins/Observable')

/*
 * Initialize a recording object
 *
 * @param {Object} [options]
 * @param {String} [options.swfPath] Path to the fallback SWF file
 *
 */

var Recorder = function Recorder(options) {
  this.Adapter =
    adapters[options.adapter] ||
    _.find(adapters, function find(adapter) {
      return adapter.isSupported()
    }) ||
    adapters.swf
  this.initialize(options)
}

Recorder.prototype = {
  relay: [
    'stopped:playing',
    'started:recording',
    'stopped:recording',
    'recorder:initialized',
    'media-stream-source:created',
  ],

  initialize(options) {
    this.adapter = new this.Adapter(options).addObserver(this, [
      'started:recording',
      'stopped:playing',
      'stopped:recording',
      'recorder:initialized',
      'media-stream-source:created',
    ])
  },

  startRecording() {
    this.adapter.startRecording()
  },

  stopRecording() {
    this.adapter.stopRecording()
  },

  startPlaying() {
    this.adapter.startPlaying()
  },

  stopPlaying() {
    this.adapter.stopPlaying()
  },

  reset() {
    this.adapter.reset()
  },

  remove() {
    this.adapter.remove()
    this.removeObservers()
  },
}

Observable.call(Recorder.prototype)
module.exports = Recorder
