define(function(require) {
  'use strict';
  //require(['foo'], function(foo) {
  // jQuery loaded by foo module so free to use it
  //var $ = require('zepto');
  var Recorder = require('./MediaRecorderFlash');
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
