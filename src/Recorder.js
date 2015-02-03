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
var webAudioCheck = typeof(window.AudioContext) === 'function';

var Recorder = function(options) {
  this.initialize.call(this, options);
};

Recorder.instance = null;

Recorder.getInstance = function(options) {
  if (!Recorder.instance) {
    // Use Flash.
    var recorderClass = RecorderFlash;

    // Use HTML5 features (Web Audio API).
    if (getUserMediaCheck && webAudioCheck) {
      recorderClass = RecorderHtml5;
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

Recorder.prototype.getData = function getData() {
  console.log('Recorder.getData');
};

Recorder.prototype._onEnded = function _onEnded() {
  if (this.onended) {
    this.onended.call(this);
  }
};



if (typeof module !== 'undefined' && module.exports) {
  module.exports = Recorder;
}
