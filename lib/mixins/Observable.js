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
    (events || []).forEach(_.bind(function(event) {
      var method = eventToCallback(event);
      this._events[method] || (this._events[method] = []);
      this._events[method].push(observer);
    }, this));
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

