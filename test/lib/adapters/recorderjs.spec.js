
var RecorderJsAdapter = require('../../../lib/adapters/recorderjs');
var adapterApi = ['startRecording', 'stopRecording', 'startPlaying', 'stopPlaying', 'reset'];
var _ = require('underscore');
var sinon = require('sinon');

describe('RecorderJsAdapter', function() {
  var adapter, observer;

  describe('isSupported', function() {
    context('client supports web audio', function() {
      before(function() {
        window.AudioContext = {fake: 'fake'};
      });

      after(function() {
        delete window.AudioContext;
      });

      it('is supported', function() {
        RecorderJsAdapter.isSupported();
      });
    });
  });

  before(function() {
    window = {
      AudioContext: {}
    };
    adapter = new RecorderJsAdapter();
  });

  it('supports the adapter interface', function() {
    _.each(adapterApi, function(name) {
      expect(typeof adapter[name]).to.eql('function');
    });
  });
});
