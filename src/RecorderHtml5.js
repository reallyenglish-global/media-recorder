var RecorderHtml5 = function(options) {
  this.initialize.call(this, options);
};

RecorderHtml5.prototype.constructor = Recorder;

RecorderHtml5.prototype.initialize = function(cfg) {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
  if (!AudioContext) {
    console.log('WebAudio not supported.');
  }
  if (!navigator.getUserMedia) {
    console.log('Navigator.getUserMedia not supported.');
  }

  this.audio_context = new AudioContext;
  this.recLength = 0;
  this.recBuffersL = [];
  this.recBuffersR = [];
  var config = cfg || {};
  this.bufferLen = config.bufferLen || 4096;
  this.sampleRate = this.audio_context.sampleRate;
  navigator.getUserMedia({audio: true}, _.bind(this.prepare, this), function(e) {
    console.log('No live audio input: ' + e);
  });
};

RecorderHtml5.prototype.prepare = function prepare(stream) {
  this.input = this.audio_context.createMediaStreamSource(stream);
  this.context = this.input.context;
  this.node = (this.context.createScriptProcessor ||
             this.context.createJavaScriptNode).call(this.context,
                                                     this.bufferLen, 2, 2);
  this.node.onaudioprocess = _.bind(this.onAudioProcess, this);
  this.input.connect(this.node);
  this.node.connect(this.context.destination);
};

RecorderHtml5.prototype.onAudioProcess = function onAudioProcess(e) {
  if (!this.recording) return;
  var buffer = [new Float32Array(e.inputBuffer.getChannelData(0)), new Float32Array(e.inputBuffer.getChannelData(1))];
  this.recBuffersL.push(buffer[0]);
  this.recBuffersR.push(buffer[1]);
  this.recLength += buffer[0].length;
};

RecorderHtml5.prototype.record = function record() {
  this.clear();
  this.recording = true;
};

RecorderHtml5.prototype.clear = function clear() {
  this.recLength = 0;
  this.recBuffersL = [];
  this.recBuffersR = [];
};

RecorderHtml5.prototype.getBuffer = function getBuffer() {
  var buffers = [];
  buffers.push( this.mergeBuffers(this.recBuffersL, this.recLength) );
  buffers.push( this.mergeBuffers(this.recBuffersR, this.recLength) );
  return buffers;
};

RecorderHtml5.prototype.mergeBuffers = function mergeBuffers(recBuffers, recLength){
  var result = new Float32Array(recLength);
  var offset = 0;
  for (var i = 0; i < recBuffers.length; i++){
    result.set(recBuffers[i], offset);
    offset += recBuffers[i].length;
  }
  return result;
};

RecorderHtml5.prototype.play = function play() {
  var buffers = this.getBuffer();
  var newBuffer = this.audio_context.createBuffer(2, buffers[0].length, this.audio_context.sampleRate);
  this.outputSource = this.audio_context.createBufferSource();
  newBuffer.getChannelData(0).set(buffers[0]);
  newBuffer.getChannelData(1).set(buffers[1]);
  this.outputSource.buffer = newBuffer;
  this.outputSource.connect(this.audio_context.destination);
  this.outputSource.start(0);
};

RecorderHtml5.prototype.stop = function stop() {
  this.recording = false;
};
