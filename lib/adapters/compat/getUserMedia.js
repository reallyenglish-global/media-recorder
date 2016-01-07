'use strict'

var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

if(!getUserMedia) { console.log('getUserMedia not supported'); }

module.exports = getUserMedia;
