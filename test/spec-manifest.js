(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = {
  'mobile': require('./mobile'),
  'recorderjs': require('./recorderjs'),
  'swf': require('./swf')
};

},{"./mobile":2,"./recorderjs":3,"./swf":4}],2:[function(require,module,exports){
'use strict';

var _ = require('underscore');
var Observable = require('../mixins/Observable');

var MobileAdapter = function(config) {
  this.initialize(config);
};

MobileAdapter.isSupported = function() {
  return !_.isEmpty(window.rels) && !_.isEmpty(window.rels.mobile);
};

MobileAdapter.prototype = {

  initialize: function(){
    this.Recorder = window.rels.mobile.recorder;

    this.recorder = new this.Recorder();
    this.recorder.addObserver(this, ['error', 'playback-ended']);
  },

  startRecording: function() {
    this.stopPlaying();
    this.stopRecording();

    this.recorder.startRecord();

    this.notifyObservers('onStartedRecording');
  },

  stopRecording: function() {
    this.recorder && this.recorder.stopRecord();
  },

  startPlaying: function() {
    this.recorder.play();
  },

  stopPlaying: function() {
    this.recorder && this.recorder.stop();
    this.notifyObservers('onStoppedPlaying');
  },

  remove: function() {
    this.reset();
    this.recorder.release();
    delete this.recorder;
    this.removeObservers();
  },

  reset: function() {
    if(this.recorder) {
      this.stopRecording();
      this.stopPlaying();
    }
  },

  onError: function(e) {
    // TODO something sensible here...
  },

  onPlaybackEnded: function() {
    this.notifyObservers('onStoppedPlaying');
  }
};

Observable.call(MobileAdapter.prototype);
module.exports = MobileAdapter;


},{"../mixins/Observable":7,"underscore":"underscore"}],3:[function(require,module,exports){
/* globals window, navigator, require, module, console */
'use strict';

var _ = require('underscore');
var $ = require('jquery');

var Observable = require('../mixins/Observable');
var RecorderJs = require('recorderjs');
require('webrtc-adapter');
var audioContext;


var RecorderJsAdapter = function(config) {
  this.initialize(config);
};

RecorderJsAdapter.isSupported = function() {
  // consider using browserDetails to specify exactly which browsers we are supporting here.
  return (navigator.mediaDevices && typeof(navigator.mediaDevices.getUserMedia) === 'function') && (window.location.protocol === 'https:');
};

RecorderJsAdapter.prototype = {

  initialize: function() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = audioContext || new window.AudioContext();
  },

  startRecording: function() {
    this.ensureRecorder().then(_.bind(function(recorder) {

      this.stopHandler(recorder, function(recorder) {
        recorder.getBuffer(_.bind(this._onRecorded, this));
      }).record();

      this.notifyObservers('onStartedRecording');
    }, this));
  },

  ensureRecorder: function() {
    var d = $.Deferred();

    _.delay(function() {
      navigator.mediaDevices.getUserMedia({audio: true}).then(function(stream) {
        var sourceStream =  audioContext.createMediaStreamSource(stream);
        d.resolve(new RecorderJs(sourceStream));
      }, function(e) {
        console.log('RecorderCore#No live audio input: ' + e);
        d.reject(e);
      });
    }, 0);
    return d;
  },

  startPlaying: function() {
    var source = audioContext.createBufferSource();

    source.buffer = this.recording;
    source.connect(audioContext.destination);

    this.stopHandler(source).start(0);
    this.notifyObservers('onStartedPlaying');
  },

  stop: function() {},

  stopRecording: function() {
    this.stop();
  },

  stopPlaying: function() {
    this.stop();
  },

  stopHandler: function(resource, postProcess) {

    this.stop = _.once(_.bind(function() {
      resource.stop();
      postProcess && postProcess.call(this, resource);
      var event = (resource instanceof RecorderJs) ? 'onStoppedRecording' : 'onStoppedPlaying';
      this.notifyObservers(event);
    }, this));

    resource.onended = this.stop;

    return resource;
  },

  // Resets the recording, releases observers
  remove: function() {
    this.reset();
    this.removeObservers();
  },

  _audioContextError: function(e) {
    switch(e.name) {
      case 'InvalidStateError':
        break;
      default:
        throw e;
    }
  },

  reset: function() {
    this.recording = undefined;
    this.stop();
  },

  _onRecorded: function(buffers) {
    var buffer = audioContext.createBuffer(2, buffers[0].length, audioContext.sampleRate );
    buffer.getChannelData(0).set(buffers[0]);
    buffer.getChannelData(1).set(buffers[1]);
    this.recording = buffer;
    this.notifyObservers('onStoppedRecording');
  }
};

Observable.call(RecorderJsAdapter.prototype);
module.exports = RecorderJsAdapter;

},{"../mixins/Observable":7,"jquery":"jquery","recorderjs":"recorderjs","underscore":"underscore","webrtc-adapter":"webrtc-adapter"}],4:[function(require,module,exports){
'use strict'

var swfobject = require('./swf/swfobject');
var _ = require('underscore');
var Observable = require('../mixins/Observable');

var SwfAdapter = function(config) {
  this.initialize(config);
};

SwfAdapter.isSupported = function() {
  try {
    if(new window.ActiveXObject('ShockwaveFlash.ShockwaveFlash')) {
      return true;
    }
  } catch (e) {
    return navigator.mimeTypes
          && navigator.mimeTypes['application/x-shockwave-flash'] !== undefined
          && navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin;
  }
};

var MAGICAL_SWF_OBJECT_INDEX = 3;

SwfAdapter.prototype = {
  swfSource: 'recorder.swf',

  initialize: function(config) {
    //global handler for Flash
    window.flashRecorder = this;
    this._events = [];
    this._initialized = false;
    this._recording = false;

    if (config.swfPath) {
      this.swfSource = config.swfPath;
    }

    this._setupFlashContainer();
    this._loadFlash();
    this.bind('initialized', this._onInitialized);
    this.bind('mp3Data', this._onDataReady);
    this.bind('ended', this._onEnded);
    this.bind('microphoneMuted', this._showFlash);
    this.bind('record', this._onStartedRecording);
  },

  startRecording: function() {
    this.flashInterface() && this.flashInterface().recordStart();
  },

  stopRecording: function() {
    if(this._recording) {
      this._recording = false;
      this.flashInterface().recordStop()/1000;
    }
  },

  startPlaying: function() {
    this.flashInterface() && this.flashInterface().playback();
  },

  stopPlaying: function() {
    this.flashInterface() && this.flashInterface().playPause();
  },

  reset: function() {
  },

  remove: function() {
    this.flashInterface = null;
    // Do not assume the element is still in the DOM
    // when it is not in the dom you get:
    // Uncaught NotFoundError: Failed to execute 'removeChild' on 'Node':
    // The node to be removed is not a child of this node.
    if(document.getElementById(this.flashContainer.id)) {
      document.body.removeChild(this.flashContainer);
    }
    this.removeObservers();
  },

  _onStartedRecording: function() {
    this._hideFlash();
    this._recording = true;
    this.notifyObservers('onStartedRecording');
  },

  _setupFlashContainer: function() {
    this.flashContainer = document.createElement("div");
    this.flashContainer.setAttribute("id", "recorderFlashContainer");
    this.flashContainer.setAttribute("style", "position: fixed; left: -9999px; top: -9999px; width: 230px; height: 140px;");
    document.body.appendChild(this.flashContainer);
  },

  _checkForFlashBlock: function() {
    window.setTimeout(_.bind(function(){
      if(!this._initialized){
        this._flashBlockCatched = true;
        this._showFlash();
      }
    }, this), 800);
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
    }else if(this.swfObject.children[MAGICAL_SWF_OBJECT_INDEX] &&
             this.swfObject.children[MAGICAL_SWF_OBJECT_INDEX].recordStart){
      return this.swfObject.children[MAGICAL_SWF_OBJECT_INDEX];
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
};

Observable.call(SwfAdapter.prototype);

module.exports = SwfAdapter;

},{"../mixins/Observable":7,"./swf/swfobject":5,"underscore":"underscore"}],5:[function(require,module,exports){
module.exports = function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O.ActiveXObject!=D){try{var ad=new ActiveXObject(W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){(function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(M.wk){(function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()})()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return !a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?"ActiveX":"PlugIn",ac="MMredirectURL="+encodeURI(O.location).toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(M.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},removeSWF:function(X){if(M.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}}();

},{}],6:[function(require,module,exports){
'use strict'

var _ = require('underscore');
var adapters = require('./adapters/');
var Observable = require('./mixins/Observable');

var Adapter = _.find(adapters, function(adapter) {
  return adapter.isSupported();
});

Adapter = Adapter || adapters.swf;


/*
 * Initialize a recording object
 *
 * @param {Object} [options]
 * @param {String} [options.swfPath] Path to the fallback SWF file
 *
*/
var Recorder = function(options) {
  this.initialize(options);
};

Recorder.prototype = {

  relay: [
    'stopped:playing',
    'started:recording'
  ],

  initialize: function(options) {
    this.adapter = new Adapter(options)
    .addObserver(this,[
      'started:recording',
      'stopped:playing'
    ]);
  },

  startRecording: function() {
    this.adapter.startRecording();
  },

  stopRecording: function() {
    this.adapter.stopRecording();
  },

  startPlaying: function() {
    this.adapter.startPlaying();
  },

  stopPlaying: function() {
    this.adapter.stopPlaying();
  },

  reset: function() {
    this.adapter.reset();
  },

  remove: function() {
    this.adapter.remove();
    this.removeObservers();
  }
};

Observable.call(Recorder.prototype);
module.exports = Recorder;

},{"./adapters/":1,"./mixins/Observable":7,"underscore":"underscore"}],7:[function(require,module,exports){
'use strict';
var _ = require('underscore');

function eventToCallback(event) {
  var parts = event.split(/[:|-]/);
  var capitalized = _.map(parts, function(part) {
    return part.charAt(0).toUpperCase() + part.substring(1).toLowerCase();
  });
  return 'on' + capitalized.join('');
}


module.exports = function() {

  this.observe = function(subject, events) {
    subject.addObserver(this, events);
    return this;
  },

  this.unobserve = function(subject, events) {
    var targets = _.pick(subject._events, events);
    _.each(targets, function(observers, handler) {
       var index = observers.indexOf(this);
       index !== -1 && observers.splice(index, 1);
    }, this);
    return this;
  },

  this.addObserver = function(observer, events) {
    this.addObserving.call(observer, this);


    this._events || (this._events = {});
    _.each([].concat(events), function(event) {
      var method = eventToCallback(event);
      this._events[method] || (this._events[method] = []);
      this._events[method].push(observer);
    }, this);
    return this;
  };

  this.addObserving = function(observed) {
    this._observing || (this._observing = []);
    var index = this._observing.indexOf(observed);
    index === -1 && this._observing.push(observed);
  },

  this.removeObserver = function(observer) {
    _.each(this._events, function(observers, handler) {
      var index = observers.indexOf(observer);
      index !== -1 && observers.splice(index, 1);
    }, this);
    return this;
  };

  this.removeObservers = function(detatch) {
    this._events = {};
    if(detatch) {
      _.each(this._observing, function(observed) {
        observed.removeObserver(this);
      }, this);
    }
    return this;
  };

  this.notifyObservers = function(method) {
    this._events || (this._events = {});
    var observers = this._events[method];
    var args = [observers, method].concat(Array.prototype.splice.call(arguments, 1));
    _.invoke.apply(this, args);
    return this;
  };

  var wrap = function(event, broadcastWith) {

    var method = eventToCallback(event);
    var preDefined = this[method];

    this[method] = function() {

      var args = _.toArray(arguments);

      _.isFunction(preDefined) && preDefined.apply(this, args);

      // We forbid exposing interal objects when broadcasting.
      broadcastWith && (args = [_.result(this, broadcastWith)]);
      args.unshift(method);
      this.notifyObservers.apply(this, args);
    }
  };

  // relay simply notifies observers forwarding any
  // data provided and should be used to bubble up from subnodes
  _.each(_.extend({}, this.relay), function(event) {
    wrap.call(this, event);
  }, this);

  // broadcast ensures that the first parameter is a cloned state object
  // talking to external libraries.
  _.each(_.extend({}, this.broadcast), function(event) {
    wrap.call(this, event, 'inspect');
  }, this);

  // Transpose takes received broadcasts and maps them on to a local
  // event broker. Any predefined handle for the broadcast will be executed
  // before the broadcast is triggered
  _.each(_.extend({}, this.transpose), function(event, observable) {
    var predefined = this[observable];
    this[observable] = function() {
      var args = _.toArray(arguments);
      predefined && predefined.apply(this, args);
      this.trigger && this.trigger.apply(this, [event].concat(args))
    }
  }, this);

  var remove = this.remove;

  this.remove = function() {
    remove && remove.call(this);
    this.removeObservers(true);
  }
}


},{"underscore":"underscore"}],8:[function(require,module,exports){
var MobileAdapter = require('../../../lib/adapters/mobile');
var adapterApi = ['startRecording', 'stopRecording', 'startPlaying', 'stopPlaying', 'reset'];
var _ = require('underscore');

describe('MobileAdapter', function() {
  describe('isSupported', function() {
    context('client supports mobile app recording', function() {
      before(function() {
        window.rels = {
          mobile: {
            recorder: {}
          }
        };
      });

      after(function() {
        delete window.rels;
      });

      it('returns true', function() {
        expect(MobileAdapter.isSupported()).to.be.true;
      });
    });

    context('client does not support mobile app recording', function() {
      it('returns false', function() {
        expect(MobileAdapter.isSupported()).to.be.false;
      });
    });
  });

  describe('supports adapter API', function() {
    var adapter;

    before(function() {
      window.rels = {
        mobile: {
          recorder: function() {
            this.addObserver = function() {}
          }
        }
      };
      adapter = new MobileAdapter();
    });

    after(function() {
      delete window.rels;
    });


    it('supports the adapter interface', function() {
      _.each(adapterApi, function(name) {
        expect(typeof adapter[name]).to.eql('function');
      });
    });
  });
});

},{"../../../lib/adapters/mobile":2,"underscore":"underscore"}],9:[function(require,module,exports){
'use strict';
describe('RecorderJsAdapter', function() {
  var RecorderJsAdapter = require('../../../lib/adapters/recorderjs');
  var adapterApi = ['startRecording', 'stopRecording', 'startPlaying', 'stopPlaying', 'reset'];
  var _ = require('underscore');
  var con;

  before(function() {
    con = window.AudioContext;
    window.AudioContext = function() {
      this.fake = 'fake'
    };
  });

  after(function() {
    window.AudioContext = con;
  });

  var adapter, observer;

  describe('isSupported', function() {
    context('client supports web audio', function() {
      it('is supported', function() {
        RecorderJsAdapter.isSupported();
      });
    });
  });

  before(function() {
    window = {
      AudioContext: {}
    };
    adapter = new RecorderJsAdapter();
  });

  it('supports the adapter interface', function() {
    _.each(adapterApi, function(name) {
      expect(typeof adapter[name]).to.eql('function');
    });
  });
});

},{"../../../lib/adapters/recorderjs":3,"underscore":"underscore"}],10:[function(require,module,exports){
'use strict';

var _ = require('underscore');

describe('MediaRecorder', function() {

  var MediaRecorder = require('../../lib/media-recorder');
  var sandbox = sinon.sandbox.create();
  var api = ['startRecording', 'stopRecording', 'startPlaying', 'stopPlaying', 'reset'];
  var broadcasts = ['stopped:playing', 'started:recording'];
  var recorder
  var adapter = { remove: function() {}};

  var observer = {
    onStartedRecording: sandbox.spy(),
    onStoppedPlaying: sandbox.spy()
  };

  before(function() {
    _.each(api, function(func) {
      adapter[func] = sandbox.spy();
    });
    recorder = new MediaRecorder({});
    recorder.adapter = adapter;
    recorder.addObserver(observer, broadcasts);
  });

  after(function() {
    sandbox.restore();
    recorder.remove();
  });

  it('Relays api functions to adapter', function() {

    _.each(api, function(name) {
      recorder[name]();
      expect(adapter[name]).to.have.been.called;
    });
  });

  it('Relays broadcasts', function() {

    _.each(['onStoppedPlaying', 'onStartedRecording'], function(name) {
      recorder[name]();
      expect(observer[name]).to.be.called;
    });
  });
});


},{"../../lib/media-recorder":6,"underscore":"underscore"}]},{},[8,9,10]);
