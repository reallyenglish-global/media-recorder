'use strict'

var MediaRecorder = require('../../lib/media-recorder');
var sinon = require('sinon');
var _ = require('underscore');
var observable = require('../../lib/observable');

var relayedFunctions = ['startRecording', 'stopRecording', 'startPlaying', 'stopPlaying', 'isRecording', 'canPlay']; 

describe('MediaRecorder', function() {
  var recorder, observer, adapter;

  before(function() {
    observer = observerSpy();
    adapter = adapterSpy();
    _.extend(adapter, observable);

    recorder = new MediaRecorder({
      adapter: adapter
    });
    recorder.addObserver(observer);
  });

  it('Relays functions to adapter', function() {
    _.each(relayedFunctions, function(name) {
      recorder[name]();

      expect(adapter[name]).to.have.been.called;
    });
  });

});

var observerSpy = function() {
  return spyObject(['onStoppedPlaying']);
};

var adapterSpy = function() {
  return function() { 
    return _.extend(spyObject(relayedFunctions), observable);
  }
};

var spyObject = function(functions) {
  return _.reduce(functions, function(memo, name) {
    memo[name] = sinon.spy();
    return memo;
  }, {});
}
