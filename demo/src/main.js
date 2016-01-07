var Recorder = require('../../lib/media-recorder');
var $ = require('jquery');

var recorder, adapterSelector, stop, play, record;


var recorderObserver = {
  onStoppedPlaying: function() {
    play.show();
    stop.hide();
    record.show();
  }
}

var onReady = function() {
  stop = $('#stop');
  play = $('#play');
  record = $('#record');
  adapterSelector = $('#adapter');

  adapterSelector.change(function() {
    loadRecorder();
  });

  loadRecorder();
};

var loadRecorder = function() {
  if(recorder) { recorder.remove(); }

  recorder = new Recorder({
    adapter: adapterSelector.val()
  });

  recorder.addObserver(recorderObserver);
  bindControls();
};

var bindControls = function() {
  play.off();
  stop.off();
  record.off();

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
