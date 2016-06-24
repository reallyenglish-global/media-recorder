'use strict'

var $ = require('jquery');

if (navigator.mediaDevices) {
  module.exports = navigator.mediaDevices.getUserMedia;
}

if (navigator.getUserMedia) {
  module.exports = function() {
    var d = new $.Deferred();
    navigator.getUserMedia({audio:true}, d.resolve, d.reject);

    return d;
  }

}
var getUserMedia = function() {
  var d = new Deferred();

  navigator.getUserMedia({audio:true}, d.resolve, d.reject);

  return d;
}
// FF

var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

module.exports = getUserMedia;
