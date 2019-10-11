describe('RecorderJsAdapter', function() {
  var RecorderJsAdapter = require('../../../lib/adapters/recorderjs')
  var adapterApi = ['startRecording', 'stopRecording', 'startPlaying', 'stopPlaying', 'reset']
  var _ = require('underscore')
  var con

  before(function() {
    con = window.AudioContext
    window.AudioContext = function() {
      this.fake = 'fake'
    }
  })

  after(function() {
    window.AudioContext = con
  })

  var adapter, observer

  describe('isSupported', function() {
    context('client supports web audio', function() {
      it('is supported', function() {
        RecorderJsAdapter.isSupported()
      })
    })
  })

  before(function() {
    window = {
      AudioContext: {},
    }
    adapter = new RecorderJsAdapter()
  })

  it('supports the adapter interface', function() {
    _.each(adapterApi, function(name) {
      expect(typeof adapter[name]).to.eql('function')
    })
  })
})
