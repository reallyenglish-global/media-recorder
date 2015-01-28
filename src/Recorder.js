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

Recorder.instance = null;

Recorder.getInstance = function(options) {
  if (!Recorder.instance) {
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
    Recorder.instance = new recorderClass(options);
  }
  return Recorder.instance;
};

Recorder.prototype.initialize = function(cfg) {
};

Recorder.prototype.record = function record() {
  console.log('Recorder.record');
};

Recorder.prototype.clear = function clear() {
  console.log('Recorder.clear');
};

Recorder.prototype.play = function play() {
  console.log('Recorder.play');
};

Recorder.prototype.stop = function stop() {
  console.log('Recorder.stop');
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Recorder;
}
