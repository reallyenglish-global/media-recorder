'use strict'

var AudioContext = window.AudioContext || window.webkitAudioContext;

if(!AudioContext) { throw new Error('WebAudio IS NOT SUPPORTED!!'); }

module.exports = AudioContext;
