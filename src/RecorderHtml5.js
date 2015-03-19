function floatTo16BitPCM(output, offset, input){
  for (var i = 0; i < input.length; i++, offset+=2){
    var s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}
function writeString(view, offset, string){
  for (var i = 0; i < string.length; i++){
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
function interleave(inputL, inputR){
  var length = inputL.length + inputR.length;
  var result = new Float32Array(length);

  var index = 0,
    inputIndex = 0;

  while (index < length){
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
}

function encodeWAV(samples, sampleRate){
  var buffer = new ArrayBuffer(44 + samples.length * 2);
  var view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* RIFF chunk length */
  view.setUint32(4, 36 + samples.length * 2, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, 2, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 4, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 4, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  floatTo16BitPCM(view, 44, samples);

  return view;
}

var RecorderHtml5 = function(options) {
  this.initialize.call(this, options);
};

RecorderHtml5.prototype = new Recorder();
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
  navigator.getUserMedia({audio: true}, bind(this.prepare, this), function(e) {
    console.log('No live audio input: ' + e);
  });
};

RecorderHtml5.prototype.prepare = function prepare(stream) {
  this.stream = stream;
  this.input = this.audio_context.createMediaStreamSource(stream);
  this.context = this.input.context;
  this.node = (this.context.createScriptProcessor ||
             this.context.createJavaScriptNode).call(this.context,
                                                     this.bufferLen, 2, 2);
  this.node.onaudioprocess = bind(this.onAudioProcess, this);
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
  this.pausedAt = null;
  this._start_recording = this.context.currentTime;
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
  this.paused = false;
  this.outputSource.buffer = newBuffer;
  this.outputSource.connect(this.audio_context.destination);
  this.outputSource.onended = bind(this._onEnded, this);
  if (this.pausedAt) {
    this.startedAt = Date.now() - this.pausedAt;
    this.outputSource.start(0, this.pausedAt / 1000);
  } else {
    this.startedAt = Date.now();
    this.outputSource.start(0);
  }
};

RecorderHtml5.prototype.stop = function stop() {
  this.recording = false;
  this.duration = this.context.currentTime - this._start_recording;
};

RecorderHtml5.prototype.pause = function pause() {
  this.outputSource.stop(0);
  this.pausedAt = Date.now() - this.startedAt;
  this.paused = true;
};

RecorderHtml5.prototype.getData = function getData(callback){
  var buffers = this.getBuffer();
  var interleaved = interleave(buffers[0], buffers[1]);
  var dataview = encodeWAV(interleaved, this.sampleRate);
  var blob = new Blob([dataview], { type: 'audio/wav' });
  if (callback) {
    callback.call(this, blob);
  }
  return blob;
};
