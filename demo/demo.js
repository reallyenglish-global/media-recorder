var $ = require('jquery');

var recorder, adapterSelector, stop, play, record;

var recorderObserver = {
  onStoppedPlaying: function() {
    play.show();
    stop.hide();
    record.show();
  },

  onStoppedRecording: function(waveFile) {
    console.log(waveFile)
    play.show();
    stop.hide();
    record.show();
  },

  onStartedRecording: function() {
    stop.show();
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

  var adapter;

  if(adapterSelector.val() != '') {
    adapter = adapterSelector.val();
  }
  recorder = new Recorder({
    adapter: adapter
  });

  recorder.addObserver(recorderObserver);
  console.log(recorder._events)
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
    recorder.startRecording();
    console.log('starting recording');
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