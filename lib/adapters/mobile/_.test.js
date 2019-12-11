/* eslint-disable */

import MobileAdapter from '.'
var sinon = require('sinon')
var adapterApi = ['startRecording', 'stopRecording', 'startPlaying', 'stopPlaying', 'reset']

var _ = require('underscore')

var STOPPED = 1,
  PLAYING = 2,
  RECORDING = 3

var fakeRecorder = function() {}

_.extend(fakeRecorder.prototype, {
  addObserver: sinon.spy(),
  startRecord: sinon.spy(),
  stopRecord: sinon.spy(),
  play: sinon.spy(),
  stop: sinon.spy(),
  release: sinon.spy(),
  reset: sinon.spy(),
})

var setupFakeRecorder = function() {
  window.rels = {
    mobile: {
      recorder: fakeRecorder,
    },
  }
}

var removeFakeRecorder = function() {
  delete window.rels
}

describe('MobileAdapter', function() {
  describe('isSupported', function() {
    context('client supports mobile app recording', function() {
      before(setupFakeRecorder)
      after(removeFakeRecorder)

      it('returns true', function() {
        expect(MobileAdapter.isSupported()).to.be.true
      })
    })

    context('client does not support mobile app recording', function() {
      it('returns false', function() {
        expect(MobileAdapter.isSupported()).to.be.false
      })
    })
  })

  describe('supports adapter API', function() {
    var adapter

    before(function() {
      setupFakeRecorder()
      adapter = new MobileAdapter()
    })

    after(removeFakeRecorder)

    it('supports the adapter interface', function() {
      _.each(adapterApi, function(name) {
        expect(_.bind(adapter[name], adapter)).to.not.throw(Error)
      })
    })
  })

  describe('onPlaybackEnded', function() {
    var adapter
    const observer = {
      onStoppedPlaying: sinon.spy(),
    }

    before(function() {
      setupFakeRecorder()
      adapter = new MobileAdapter()
      adapter.addObserver(observer, ['stopped-playing'])

      adapter.startPlaying()

      adapter.onPlaybackEnded()
    })

    after(removeFakeRecorder)

    it('notifies', function() {
      expect(observer.onStoppedPlaying).to.have.been.called
    })

    it('calls stop on recorder', function() {
      expect(fakeRecorder.prototype.stop).to.have.been.called
    })

    it('sets the correct state', function() {
      expect(adapter.state).to.eql(STOPPED)
    })
  })

  describe('onRecordingStarted', function() {
    var adapter
    const observer = {
      onStartedRecording: sinon.spy(),
    }

    before(function() {
      setupFakeRecorder()
      adapter = new MobileAdapter()
      adapter.addObserver(observer, ['started-recording'])

      adapter.onRecordingStarted()
    })

    after(removeFakeRecorder)

    it('notifies', function() {
      expect(observer.onStartedRecording).to.have.been.called
    })
  })

  describe('stopRecording', function() {
    var adapter
    const observer = {
      onStoppedRecording: sinon.spy(),
    }

    before(function() {
      setupFakeRecorder()
      adapter = new MobileAdapter()
      adapter.startRecording()

      adapter.stopRecording()
    })

    after(removeFakeRecorder)

    it('calls stopRecord on recorder', function() {
      expect(fakeRecorder.prototype.stopRecord).to.have.been.called
    })
  })

  describe('onRecordingStopped', function() {
    var adapter
    const observer = {
      onStoppedRecording: sinon.spy(),
    }

    function setup() {
      setupFakeRecorder()

      adapter = new MobileAdapter()
      adapter.addObserver(observer, ['stopped-recording'])

      adapter.startRecording()
    }

    function teardown() {
      removeFakeRecorder()
    }

    describe('when the recorder is recording', function() {
      before(function() {
        setup()
        adapter.onRecordingStopped()
      })

      after(teardown)

      it('notifies', function() {
        expect(observer.onStoppedRecording).to.have.been.called
      })

      it('sets the correct state', function() {
        expect(adapter.state).to.eql(STOPPED)
      })
    })

    describe('when the recorder is not recording', function() {
      before(function() {
        setup()
        adapter.stopRecording()
        adapter.onRecordingStopped()
        observer.onStoppedRecording.resetHistory()
        adapter.onRecordingStopped()
      })

      after(teardown)

      it('notifies', function() {
        expect(observer.onStoppedRecording).not.to.have.been.called
      })
    })
  })
})
