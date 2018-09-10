'use strict';

var _ = require('underscore'),
    MediaRecorder = require('../../lib/media-recorder'),
    MobileAdapter = require('../../lib/adapters/mobile'),
    RecorderJsAdapter = require('../../lib/adapters/recorderjs'),
    SwfAdapter = require('../../lib/adapters/swf');

describe('MediaRecorder', function() {

  describe('standard usage', function() {
    var api = ['startRecording', 'stopRecording', 'startPlaying', 'stopPlaying', 'reset'];
    var broadcasts = ['stopped:playing', 'started:recording', 'stopped:recording'];
    var recorder
    var adapter = { remove: function() {}};

    var observer = {
      onStartedRecording: sinon.spy(),
      onStoppedPlaying: sinon.spy(),
      onStoppedRecording: sinon.spy()
    };

    before(function() {
      _.each(api, function(func) {
        adapter[func] = sinon.spy();
      });
      recorder = new MediaRecorder({});
      recorder.adapter = adapter;
      recorder.addObserver(observer, broadcasts);
    });

    after(function() {
      sinon.restore();
      recorder.remove();
    });

    it('Relays api functions to adapter', function() {

      _.each(api, function(name) {
        recorder[name]();
        expect(adapter[name]).to.have.been.called;
      });
    });

    it('Relays broadcasts', function() {

      _.each(['onStoppedPlaying', 'onStartedRecording', 'onStoppedRecording'], function(name) {
        recorder[name]();
        expect(observer[name]).to.be.called;
      });
    });
  });

  describe('choosing the correct adapter', function() {
    var recorder;

    before(function() {
      recorder = new MediaRecorder({});
    });

    context('mobile', function() {
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

      it('chooses the mobile adapter', function() {
        expect(recorder.Adapter.name).to.eql(MobileAdapter.name);
      });
    });

    context('web audio', function() {
      var con;
      before(function() {
        con = window.AudioContext;
        window.AudioContext = function() {
          this.fake = 'fake'
        };
      });

      after(function() {
        window.AudioContext = con;
      });

      it('chooses the recorderjs adapter', function() {
        expect(recorder.Adapter.name).to.eql(RecorderJsAdapter.name);
      });
    });

    context('fallback', function() {
      it('chooses the swf adapter', function() {
        expect(recorder.Adapter.name).to.eql(SwfAdapter.name);
      });
    });
  });
});
