'use strict'

var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

if(!getUserMedia) { console.log('getUserMedia not supported'); }

module.exports = getUserMedia;
