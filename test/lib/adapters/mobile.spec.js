var MobileAdapter = require('../../../lib/adapters/mobile');
var sinon = require('sinon');
var adapterApi = ['startRecording', 'stopRecording', 'startPlaying', 'stopPlaying', 'reset'];
var _ = require('underscore');

var STOPPED = 1,
    PLAYING = 2,
    RECORDING = 3

var fakeRecorder = function() {};

_.extend(fakeRecorder.prototype, {
  addObserver: sinon.spy(),
  startRecord: sinon.spy(),
  stopRecord: sinon.spy(),
  play: sinon.spy(),
  stop: sinon.spy(),
  release: sinon.spy(),
  reset: sinon.spy()
});

var setup = function() {
  window.rels = {
    mobile: {
      recorder: fakeRecorder
    }
  };
}

var teardown = function() {
  delete window.rels;
}


describe('MobileAdapter', function() {
  describe('isSupported', function() {
    context('client supports mobile app recording', function() {
      before(setup);
      after(teardown);

      it('returns true', function() {
        expect(MobileAdapter.isSupported()).to.be.true;
      });
    });

    context('client does not support mobile app recording', function() {
      it('returns false', function() {
        expect(MobileAdapter.isSupported()).to.be.false;
      });
    });
  });

  describe('supports adapter API', function() {
    var adapter;

    before(function() {
      setup();
      adapter = new MobileAdapter()
    });

    after(teardown);

    it('supports the adapter interface', function() {
      _.each(adapterApi, function(name) {
        expect(_.bind(adapter[name], adapter)).to.not.throw(Error);
      });
    });
  });

  describe('onPlaybackEnded', function() {
    var adapter,
        observer = {
          onStoppedPlaying: sinon.spy()
        };

    before(function() {
      setup();
      adapter = new MobileAdapter();
      adapter.addObserver(observer, ['stopped-playing']);

      adapter.startPlaying();

      adapter.onPlaybackEnded();
    });

    after(teardown);

    it('notifies', function() {
      expect(observer.onStoppedPlaying).to.have.been.called;
    });

    it('sets the correct state', function() {
      expect(adapter.state).to.eql(STOPPED);
    });
  });
});
