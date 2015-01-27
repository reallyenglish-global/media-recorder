navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
window.URL = window.URL || window.webkitURL;

function bind(func, context) {
  return function() {
    func.apply(context, arguments);
  };
}
// Feature detection.
var getUserMediaCheck = typeof(navigator.getUserMedia) === 'function';
var mediaRecorderCheck = typeof(window.MediaRecorder) === 'function';
var webAudioCheck = typeof(window.AudioContext) === 'function';

var Recorder = function(options) {
  this.initialize.call(this, options);
};

Recorder.getInstance = function(options) {
  // Use the MediaRecorder API. Currently only works in firefox.
  if (getUserMediaCheck && webAudioCheck && mediaRecorderCheck) {
    recorderClass = RecorderAPI;
  // Use HTML5 features (Web Audio API).
  } else if (getUserMediaCheck && webAudioCheck && !mediaRecorderCheck) {
    recorderClass = RecorderHtml5;
    // Use Flash.
  } else {
    recorderClass = RecorderFlash;
  }
  return new recorderClass(options);
};

Recorder.prototype.initialize = function(cfg) {
};

Recorder.prototype.record = function record() {
};

Recorder.prototype.clear = function clear() {
};

Recorder.prototype.play = function play() {
};

Recorder.prototype.stop = function stop() {
  this.recording = false;
};
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Recorder;
}
