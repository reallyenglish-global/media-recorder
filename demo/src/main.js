var Recorder = require('../../lib/media-recorder');
var $ = require('jquery');

var recorder, adapterSelector, play, stop, record;

var recorderObserver = {
  onStoppedPlaying: function() {
    console.log('onStoppedPlaying');
    play.show();
    stop.hide();
    record.show();
  }
}

var onReady = function() {
  adapterSelector = $('#adapter');

  adapterSelector.change(function() {
    loadRecorder();
  });

  bindControls();
  loadRecorder();
};

var loadRecorder = function() {
  recorder = new Recorder({
    adapter: adapterSelector.val()
  });

  recorder.addObserver(recorderObserver);
};

var bindControls = function() {
  stop = $('#stop');
  play = $('#play');
  record = $('#record');

  play.click(function() {
    record.hide();
    play.hide();
    stop.show();
    recorder.startPlaying();
  });

  record.click(function() {
    record.hide();
    play.hide();
    stop.show();
    recorder.startRecording();
  });

  stop.click(function() {
    record.show();
    play.show();
    stop.hide();
    recorder.stopRecording();
    recorder.stopPlaying();
  });
};

$(document).ready(function() {
  onReady();
});
