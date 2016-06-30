'use strict'

var $ = require('jquery');

var AudioContext = window.AudioContext || window.webkitAudioContext;

// Shim in missing #close, #suspend, #resume promise for Edge browser implementation.

var shim = function() {
  var d = $.Deferred();
  window.setTimeout(function() { d.resolve(); }, 0);
  return d;
}

if(AudioContext) {
  if(!AudioContext.close)
    AudioContext.close = shim;

  if(!AudioContext.suspend)
    AudioContext.suspend = shim;

  if(!AudioContext.resume)
    AudioContext.resume = shim;
}
module.exports = AudioContext;
