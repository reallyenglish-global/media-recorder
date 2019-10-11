/* eslint-disable */
var _ = require('underscore'),
  Recorder = require('../../lib/media-recorder'),
  MobileAdapter = require('../../lib/adapters/mobile'),
  RecorderJsAdapter = require('../../lib/adapters/recorderjs'),
  SwfAdapter = require('../../lib/adapters/swf')

describe('MediaRecorder', function() {
  describe('standard usage', function() {
    var api = ['startRecording', 'stopRecording', 'startPlaying', 'stopPlaying', 'reset']
    var broadcasts = ['stopped:playing', 'started:recording', 'stopped:recording']
    var recorder
    var adapter = { remove: function() {} }

    var observer = {
      onStartedRecording: sinon.spy(),
      onStoppedPlaying: sinon.spy(),
      onStoppedRecording: sinon.spy(),
    }

    before(function() {
      window.AudioContext = function AudioContext() {
        // noop
      }
      _.each(api, function(func) {
        adapter[func] = sinon.spy()
      })
      recorder = new Recorder({})
      recorder.adapter = adapter
      recorder.addObserver(observer, broadcasts)
    })

    after(function() {
      sinon.restore()
      recorder.remove()
      window.AudioContext = undefined
    })

    it('Relays api functions to adapter', function() {
      _.each(api, function(name) {
        recorder[name]()
        expect(adapter[name]).to.have.been.called
      })
    })

    it('Relays broadcasts', function() {
      _.each(['onStoppedPlaying', 'onStartedRecording', 'onStoppedRecording'], function(name) {
        recorder[name]()
        expect(observer[name]).to.be.called
      })
    })
  })

  describe('choosing the correct adapter', function() {
    context('mobile', function() {
      before(function() {
        window.rels = {
          mobile: {
            recorder() {
              this.addObserver = () => {}
            },
          },
        }
      })

      after(function() {
        delete window.rels
      })

      it('chooses the mobile adapter', function() {
        var recorder = new Recorder({})
        expect(recorder.Adapter.name).to.eql(MobileAdapter.name)
      })
    })

    context('web audio', function() {
      var con
      before(function() {
        navigator.mediaDevices = {
          getUserMedia() {},
        }
        con = window.AudioContext
        window.AudioContext = function() {
          this.fake = 'fake'
        }
      })

      after(function() {
        window.AudioContext = con
        navigator.mediaDevices = undefined
      })

      it('chooses the recorderjs adapter', function() {
        var recorder = new Recorder({})
        expect(recorder.Adapter.name).to.eql(RecorderJsAdapter.name)
      })
    })

    context('fallback', function() {
      it('chooses the swf adapter', function() {
        var recorder = new Recorder({})
        expect(recorder.Adapter.name).to.eql(SwfAdapter.name)
      })
    })
  })
})
