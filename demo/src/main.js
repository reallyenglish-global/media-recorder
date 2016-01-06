var Recorder = require('../../lib/media-recorder');

var recorder = new Recorder();

document.addEventListener("DOMContentLoaded", function() {
  console.log('document loaded');
  var play = document.getElementById('play');
  var record = document.getElementById('record');
  var stop = document.getElementById('stop');

  record.addEventListener('click', function(e) {
    recorder.startRecording();
  });

  stop.addEventListener('click', function(e) {
    recorder.stopRecording();
  });

  play.addEventListener('click', function(e) {
    recorder.startPlayback();
  });
});
