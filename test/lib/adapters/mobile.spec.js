var MobileAdapter = require('../../../lib/adapters/mobile');
var adapterApi = ['startRecording', 'stopRecording', 'startPlaying', 'stopPlaying', 'reset']; 
var _ = require('underscore');

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
      adapter = new MobileAdapter();  
    });

    it('supports the adapter interface', function() {
      _.each(adapterApi, function(name) {
        expect(typeof adapter[name]).to.eql('function');
      });
    });
  });
});
