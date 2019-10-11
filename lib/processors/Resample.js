var $ = require('jquery')
var _ = require('underscore')

module.exports = {
  options: ['sampleRate', 'numChannels'],

  configure(options) {
    _.extend(module.exports, _.pick(options, module.exports.options))
    return module.exports
  },

  sampleRate: 44100,

  numChannels: 2,

  process(audioBuffer) {
    var d = $.Deferred()
    var sampleRate = module.exports.sampleRate
    var numChannels = module.exports.numChannels
    _.delay(() => {
      var offlineContext = new window.OfflineAudioContext(
        numChannels,
        audioBuffer.duration * sampleRate,
        sampleRate,
      )
      var source = offlineContext.createBufferSource()

      source.buffer = audioBuffer
      source.start(0)
      source.connect(offlineContext.destination)
      offlineContext.startRendering()
      offlineContext.oncomplete = (event) => {
        d.resolve(event.renderedBuffer)
      }
    }, 0)
    return d
  },
}
