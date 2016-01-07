'use strict'

var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

if(!getUserMedia) { throw new Error('Navigator.getUserMedia IS NOT SUPPORTED!!'); }

module.exports = getUserMedia;
