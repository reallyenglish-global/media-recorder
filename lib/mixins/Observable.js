var _ = require('underscore')
function eventToCallback(event) {
  var parts = event.split(/[:|-]/)
  var capitalized = _.map(parts, (part) => {
    return part.charAt(0).toUpperCase() + part.substring(1).toLowerCase()
  })
  return 'on' + capitalized.join('')
}

module.exports = function Observable() {
  this.observe = function observe(subject, events) {
    subject.addObserver(this, events)
    return this
  }

  this.unobserve = function unobserve(subject, events) {
    var targets = _.pick(subject._events, events)
    _.each(
      targets,
      function remove(observers) {
        var index = observers.indexOf(this)
        index !== -1 && observers.splice(index, 1)
      },
      this,
    )
    return this
  }
  this.addObserver = function addObserver(observer, events) {
    this.addObserving.call(observer, this)
    this._events || (this._events = {})
    ;(events || []).forEach(
      _.bind(function add(event) {
        var method = eventToCallback(event)
        this._events[method] || (this._events[method] = [])
        this._events[method].push(observer)
      }, this),
    )
    return this
  }
  this.addObserving = function addObserving(observed) {
    this._observing || (this._observing = [])
    let index = this._observing.indexOf(observed)
    index === -1 && this._observing.push(observed)
  }
  this.removeObserver = function removeObserver(observer) {
    _.each(
      this._events,
      function remove(observers) {
        var index = observers.indexOf(observer)
        index !== -1 && observers.splice(index, 1)
      },
      this,
    )
    return this
  }
  this.removeObservers = function removeObservers(detatch) {
    this._events = {}
    if (detatch) {
      _.each(
        this._observing,
        function remove(observed) {
          observed.removeObserver(this)
        },
        this,
      )
    }
    return this
  }
  this.notifyObservers = function notifyObservers(method) {
    this._events || (this._events = {})
    const observers = this._events[method]
    const args = [observers, method].concat(Array.prototype.splice.call(arguments, 1))
    _.invoke.apply(this, args)
    return this
  }

  const wrap = function wrap(event, broadcastWith) {
    var method = eventToCallback(event)
    var preDefined = this[method]
    this[method] = function wrapped() {
      var args = _.toArray(arguments)
      _.isFunction(preDefined) && preDefined.apply(this, args)

      // We forbid exposing interal objects when broadcasting.
      broadcastWith && (args = [_.result(this, broadcastWith)])
      args.unshift(method)
      this.notifyObservers.apply(this, args)
    }
  }

  // relay simply notifies observers forwarding any
  // data provided and should be used to bubble up from subnodes
  _.each(
    _.extend({}, this.relay),
    function relay(event) {
      wrap.call(this, event)
    },
    this,
  )

  // broadcast ensures that the first parameter is a cloned state object
  // talking to external libraries.
  _.each(
    _.extend({}, this.broadcast),
    function broadcast(event) {
      wrap.call(this, event, 'inspect')
    },
    this,
  )

  // Transpose takes received broadcasts and maps them on to a local
  // event broker. Any predefined handle for the broadcast will be executed
  // before the broadcast is triggered
  _.each(
    _.extend({}, this.transpose),
    function transpose(event, observable) {
      var predefined = this[observable]
      this[observable] = function transposed() {
        var args = _.toArray(arguments)
        predefined && predefined.apply(this, args)
        this.trigger && this.trigger.apply(this, [event].concat(args))
      }
    },
    this,
  )

  let remove = this.remove

  this.remove = function wrappedRemove() {
    remove && remove.call(this)
    this.removeObservers(true)
  }
}
