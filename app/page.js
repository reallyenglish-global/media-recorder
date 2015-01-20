define(function(require) {
  'use strict';
  //require(['foo'], function(foo) {
  // jQuery loaded by foo module so free to use it
  //var $ = require('zepto');
  var Recorder = require('./MediaRecorder');
  var r = new Recorder();
  function createDownloadLink() {
    r && r.exportWAV(function(blob) {
      var url = URL.createObjectURL(blob);
      var li = document.createElement('li');
      var au = document.createElement('audio');
      var hf = document.createElement('a');
      
      au.controls = true;
      au.src = url;
      hf.href = url;
      hf.download = new Date().toISOString() + '.wav';
      hf.innerHTML = hf.download;
      li.appendChild(au);
      li.appendChild(hf);
      $('#recordingslist').appendChild(li);
    });
  }
  $('#record').on('click', function(e) {
    r.record();
    $('#stop').removeAttr('disabled');
    e.preventDefault();
  });
  $('#stop').on('click', function(e) {
    r.stop();
    $('#play').removeAttr('disabled');
    e.preventDefault();
    createDownloadLink();
  });
  $('#play').on('click', function(e) {
    r.play();
    e.preventDefault();
  });
});
