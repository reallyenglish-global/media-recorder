var RecorderAPI = function() {
this.initialize.call(this);
};

RecorderAPI.prototype.constructor = Recorder;

RecorderAPI.prototype.initialize = function(cfg) {
  this.data = [];
};

RecorderAPI.prototype.clear = function() {
  this.data = [];
};

RecorderAPI.prototype.onError = function(cfg) {
};

RecorderAPI.prototype.onDataAvailabe = function(e) {
  this.data.push(e.data);
};

RecorderAPI.prototype.startRecording = function(stream) {
  this.data = [];
  this.mediaRecorder = new MediaRecorder(stream);
  this.mediaRecorder.ondataavailable = bind(this.onDataAvailabe, this);
  this.mediaRecorder.onerror = function(e){
    console.log('Error: ', e);
  };
  // parameter is number of milliseconds of data to return in a single Blob
  this.mediaRecorder.start(2000);
};

RecorderAPI.prototype.record = function() {
  navigator.getUserMedia({audio: true}, bind(this.startRecording, this), this.onError);
};

RecorderAPI.prototype.play = function() {
  this.audio = document.createElement('audio');
  var blob = new Blob(this.data, { type: "text/plain" });
  this.audio.src = window.URL.createObjectURL(blob);
  this.audio.play();
};

RecorderAPI.prototype.stop = function() {
  this.mediaRecorder.stop();
};
