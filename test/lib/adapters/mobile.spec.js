var MobileAdapter = require('../../../lib/adapters/mobile');
var sinon = require('sinon');
var adapterApi = ['startRecording', 'stopRecording', 'startPlaying', 'stopPlaying', 'reset'];
var _ = require('underscore');

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

describe('MobileAdapter', function() {
  describe('isSupported', function() {
    context('client supports mobile app recording', function() {
      before(function() {
        window.rels = {
          mobile: {
            recorder: {}
          }
        };
      });

      after(function() {
        delete window.rels;
      });

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
      window.rels = {
        mobile: {
          recorder: fakeRecorder
        }
      };
      adapter = new MobileAdapter()
    });

    after(function() {
      delete window.rels;
    });

    it('supports the adapter interface', function() {
      _.each(adapterApi, function(name) {
        expect(_.bind(adapter[name], adapter)).to.not.throw(Error);
      });
    });
  });
});
