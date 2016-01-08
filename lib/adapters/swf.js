'use strict'

var swfobject = require('./swf/swfobject');
var _ = require('underscore');
var observable = require('../observable');

var SwfAdapter = function(config) {
  this.initialize(config);
};

_.extend(SwfAdapter.prototype, observable, {
  swfSource: 'recorder.swf',

  initialize: function(config) {
    //global handler for Flash
    window['flashRecorder'] = this;
    this._events = [];
    this._initialized = false;
    this._recording = false;

    if (config.swfSource) {
      this.swfSource = config.swfSource;
    }

    this._setupFlashContainer();
    this._loadFlash();
    this.bind('initialized', this._onInitialized);
    this.bind('mp3Data', this._onDataReady);
    this.bind('ended', this._onEnded);
    this.bind('microphoneMuted', this._showFlash);
    this.bind('record', this._hideFlash);
  },

  startRecording: function() {
    this.flashInterface().recordStart();
    this._recording = true;
  },

  stopRecording: function() {
    this._recording = false;
    this.duration = this.flashInterface().recordStop()/1000;
    return this.duration;
  },

  startPlaying: function() {
    this.flashInterface().playback();
  },

  stopPlaying: function() {
    this.flashInterface().playPause();
  },

  canPlay: function() {
    return true;
  },

  isRecording: function() {
    return this._recording;
  },

  remove: function() {
    this.removeObservers();
  },

  _setupFlashContainer: function() {
    this.flashContainer = document.createElement("div");
    this.flashContainer.setAttribute("id", "recorderFlashContainer");
    this.flashContainer.setAttribute("style", "position: fixed; left: -9999px; top: -9999px; width: 230px; height: 140px; margin-left: 10px; border-top: 6px solid rgba(128, 128, 128, 0.6); border-bottom: 6px solid rgba(128, 128, 128, 0.6); border-radius: 5px 5px; padding-bottom: 1px; padding-right: 1px;");
    document.body.appendChild(this.flashContainer);
  },

  _checkForFlashBlock: function() {
    window.setTimeout(_.bind(function(){
      if(!this._initialized){
        this._flashBlockCatched = true;
        this._showFlash();
      }
    }, this), 500);
  },

  _onInitialized: function(e) {
    this._initialized = true;
    if(this._flashBlockCatched){
      this._hideFlash();
    }
  },

  _onDataReady: function(e) {
    this._callbackDataReady.call(this, e);
  },

  _showFlashRequiredDialog: function() {
    this.flashContainer.innerHTML = "<p>Adobe Flash Player 10.1 or newer is required to use this feature.</p><p><a href='http://get.adobe.com/flashplayer' target='_top'>Get it on Adobe.com.</a></p>";
    this.flashContainer.style.color = "white";
    this.flashContainer.style.backgroundColor = "#777";
    this.flashContainer.style.textAlign = "center";
    this._showFlash();
  },

  _loadFlash: function() {
    var flashElement = document.createElement("div");
    flashElement.setAttribute("id", "recorderFlashObject");
    this.flashContainer.appendChild(flashElement);
    var fv = { recorderInstance: 'window.flashRecorder' };
    swfobject.embedSWF(this.swfSource, "recorderFlashObject", "231", "141", "10.1.0", undefined, fv, {allowscriptaccess: "always"}, undefined, _.bind(this._flashLoaded, this));
  },

  _flashLoaded: function(e) {
    if(e.success){
      this.swfObject = e.ref;
      this._checkForFlashBlock();
    }else{
      this._showFlashRequiredDialog();
    }
  },

  _showFlash: function() {
    this.flashContainer.style.left   = ((window.innerWidth  || document.body.offsetWidth)  / 2) - 115 + "px";
    this.flashContainer.style.top    = ((window.innerHeight || document.body.offsetHeight) / 2) - 70  + "px";
  },

  _hideFlash: function() {
    this.flashContainer.style.left = "-9999px";
    this.flashContainer.style.top  = "-9999px";
  },


  flashInterface: function() {
    if(!this.swfObject){
      return null;
    }else if(this.swfObject.recordStart){
      return this.swfObject;
    }else if(this.swfObject.children[3].recordStart){
      return this.swfObject.children[3];
    }
  },

  bind: function(eventName, fn){
    if(!this._events[eventName]){ this._events[eventName] = [] }
    this._events[eventName].push(fn);
  },

  triggerEvent: function(eventName, arg0, arg1){
    if (!this._events[eventName]) {
      return;
    }
    for(var i = 0, len = this._events[eventName].length; i < len; i++){
      if(this._events[eventName][i]){
        this._events[eventName][i].apply(this, [arg0, arg1]);
      }
    }
  },

  _onEnded: function() {
    this.notifyObservers('onStoppedPlaying');
  }
});

module.exports = SwfAdapter;
