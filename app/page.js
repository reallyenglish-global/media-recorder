define(function(require) {
  'use strict';
  //require(['foo'], function(foo) {
  // jQuery loaded by foo module so free to use it
  //var $ = require('zepto');
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
  window.URL = window.URL || window.webkitURL;

  // Feature detection.
  var getUserMediaCheck = typeof(navigator.getUserMedia) === 'function';
  var mediaRecorderCheck = typeof(window.MediaRecorder) === 'function';
  var webAudioCheck = typeof(window.AudioContext) === 'function';

  var Recorder;
  // Use the MediaRecorder API. Currently only works in firefox.
  if (getUserMediaCheck && webAudioCheck && mediaRecorderCheck) {
    Recorder = require('./MediaRecorderAPI');
  // Use HTML5 features (Web Audio API).
  } else if (getUserMediaCheck && webAudioCheck && !mediaRecorderCheck) {
    Recorder = require('./MediaRecorder');
    // Use Flash.
  } else {
    Recorder = require('./MediaRecorderFlash');
  }
  var r = new Recorder();
  $('#record').on('click', function(e) {
    r.record();
    $('#play').removeAttr('disabled');
    e.preventDefault();
  });
  $('#play').on('click', function(e) {
    r.stop();
    r.play();
    e.preventDefault();
  });
});
