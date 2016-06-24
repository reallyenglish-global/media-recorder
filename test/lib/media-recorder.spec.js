'use strict'

var _ = require('underscore');
var sinon = require('sinon');

describe('MediaRecorder', function() {

  var MediaRecorder = require('../../lib/media-recorder');
  var sandbox = sinon.sandbox.create();
  var api = ['startRecording', 'stopRecording', 'startPlaying', 'stopPlaying', 'reset'];
  var broadcasts = ['stopped:playing', 'started:recording'];
  var recorder
  var adapter = {};

  var observer = {
    onStartedRecording: sandbox.spy(),
    onStoppedPlaying: sandbox.spy()
  };

  before(function() {
    _.each(api, function(func) {
      adapter[func] = sandbox.spy();
    });
    recorder = new MediaRecorder({ adapter: adapter });
    recorder.addObserver(observer, broadcasts);
  });

  after(function() {
    sandbox.restore();
    recorder.remove();
  });

  it('Relays api functions to adapter', function() {

    _.each(api, function(name) {
      recorder[name]();
      expect(adapter[name]).to.have.been.called;
    });
  });

  it('Relays broadcasts', function() {

    _.each(['onStoppedPlaying', 'onStartedRecording'], function(name) {
      recorder[name]();
      expect(observer[name]).to.be.called;
    });
  });
});

