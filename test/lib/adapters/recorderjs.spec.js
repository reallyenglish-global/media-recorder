window = {
  AudioContext: {}
};

var RecorderJsAdapter = require('../../../lib/adapters/recorderjs');
var adapterApi = ['startRecording', 'stopRecording', 'startPlaying', 'stopPlaying', 'reset']; 
var _ = require('underscore');
var sinon = require('sinon');

describe('RecorderJsAdapter', function() {
  var adapter, observer;

  before(function() {
    observer = {
      onStoppedPlaying: sinon.spy(),
      onStartedRecording: sinon.spy()
    };

    adapter = new RecorderJsAdapter();  
    adapter.addObserver(observer);
  });

  it('supports the adapter interface', function() {
    _.each(adapterApi, function(name) {
      expect(typeof adapter[name]).to.eql('function');
    });
  });
});
