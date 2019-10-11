var $ = require('jquery')
var _ = require('underscore')

module.exports = {
  options: ['sampleRate', 'recorder'],

  configure(options) {
    _.extend(module.exports, _.pick(options, module.exports.options))
    return module.exports
  },

  sampleRate: 44100,

  recorder: undefined,

  process() {
    var recorder = module.exports.recorder
    var sampleRate = module.exports.sampleRate

    var d = $.Deferred()

    _.delay(() => {
      recorder.getBuffer((buffers) => {
        var numChannels = buffers.length
        var duration = Math.max(buffers[0].length, sampleRate)

        var offlineContext = new window.OfflineAudioContext(numChannels, duration, sampleRate)
        var buffer = offlineContext.createBuffer(numChannels, duration, sampleRate)

        for (let channel = 0; channel < buffers.length; channel++) {
          buffer.getChannelData(channel).set(buffers[channel])
        }
        d.resolve(buffer)
      })
    }, 0)
    return d
  },
}
