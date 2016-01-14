'use strict'

var AudioContext = window.AudioContext || window.webkitAudioContext;

if(!AudioContext) { console.log('AudioContext not supported'); }

module.exports = AudioContext;
