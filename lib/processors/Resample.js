var $ = require('jquery');
var _ = require('underscore')
var SAMPLE_RATE = 16000

module.exports = {
  options: [
    'sampleRate',
    'numChannels'
  ],

  configure: function(options) {
    _.extend(module.exports, _.pick(options, module.exports.options))
    return module.exports;
  },

  sampleRate: 44100,

  numChannels: 2,

  process: function(audioBuffer) {
    var d = $.Deferred()
    var sampleRate = module.exports.sampleRate
    var numChannels = module.exports.numChannels

    _.delay(function() {
      var offlineContext = new window.OfflineAudioContext(numChannels, audioBuffer.duration * sampleRate,  sampleRate)
      var source = offlineContext.createBufferSource()

      source.buffer = audioBuffer
      source.start(0)
      source.connect(offlineContext.destination)
      offlineContext.startRendering().then(function(buffer) {
        d.resolve(buffer)
      })
    }, 0)
    return d
  }
}
