var MediaRecorderAPI = function() {
this.initialize.call(this);
};

MediaRecorderAPI.prototype.initialize = function(cfg) {
  this.data = [];
};

MediaRecorderAPI.prototype.clear = function() {
  this.data = [];
};

MediaRecorderAPI.prototype.onError = function(cfg) {
};

MediaRecorderAPI.prototype.onDataAvailabe = function(e) {
  this.data.push(e.data);
};

MediaRecorderAPI.prototype.startRecording = function(stream) {
  this.data = [];
  this.mediaRecorder = new MediaRecorder(stream);
  this.mediaRecorder.ondataavailable = this.onDataAvailabe;
  this.mediaRecorder.onerror = function(e){
    console.log('Error: ', e);
  };
  // parameter is number of milliseconds of data to return in a single Blob
  this.mediaRecorder.start(2000);
};

MediaRecorderAPI.prototype.record = function() {
  var self = this;
  navigator.getUserMedia({audio: true}, function(stream) {self.startRecording.call(self, stream);}, this.onError);
};

MediaRecorderAPI.prototype.play = function() {
  this.audio = document.createElement('audio');
  var blob = new Blob(this.data, { type: "text/plain" });
  this.audio.src = window.URL.createObjectURL(blob);
  this.audio.play();
};

MediaRecorderAPI.prototype.stop = function() {
  this.mediaRecorder.stop();
};
