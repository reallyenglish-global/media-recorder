'use strict';
var _ = require('underscore');

module.exports = {
  addObserver: function(observer) {
    this._observers || (this._observers = []);
    this._observers.push(observer);
    return this;
  },

  removeObserver: function(observer) {
    this._observers || (this._observers= []);
    var index = this._observers.indexOf(observer);
    index !== -1 && this._observers.splice(index, 1);
    return this;
  },

  removeObservers: function() {
    this._observers = [];
  },

  notifyObservers: function(handler) {
    var args = _.toArray(arguments);
    args.shift();

    _.each(this._observers, function(observer) {
      if(_.isFunction(observer[handler])) {
        observer[handler].apply(observer, args);
      }
    }, this);
  }
}
