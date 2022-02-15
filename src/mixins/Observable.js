import { eventToCallback } from '../helpers'
function pick(object, keys) {
  return keys.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      Object.assign(obj, { key: object[key] })
    }
    return obj
  }, {})
}

function Observable() {
  Object.assign(this, {
    observe(subject, events) {
      subject.addObserver(this, events)
      return this
    },

    unobserve(subject, events) {
      var targets = pick(subject._events, events)
      targets.forEach((observers) => {
        var index = observers.indexOf(this)
        index !== -1 && observers.splice(index, 1)
      })
      return this
    },

    addObserver(observer, events) {
      this.addObserving.call(observer, this)

      this._events || (this._events = {})

      const observing = [].concat(events).filter(Boolean)

      observing.forEach((event) => {
        var method = eventToCallback(event)
        this._events[method] || (this._events[method] = [])
        this._events[method].push(observer)
      })
      return this
    },

    addObserving(observed) {
      this._observing || (this._observing = [])
      const index = this._observing.indexOf(observed)
      index === -1 && this._observing.push(observed)
    },

    removeObserver(observer) {
      this._events.forEach((observers) => {
        var index = observers.indexOf(observer)
        index !== -1 && observers.splice(index, 1)
      })
      return this
    },
    removeObservers(detatch) {
      this._events = {}
      if (detatch) {
        this._observing.forEach((observed) => {
          observed.removeObserver(this)
        })
      }
      return this
    },

    notifyObservers(method, ...args) {
      this._events || (this._events = {})
      let observers = [].concat(this._events[method]).filter(Boolean)
      let propagate = true
      observers.forEach((observer) => {
        let func = observer[method]
        if (typeof func === 'function' && propagate !== false) {
          propagate = func.apply(observer, args)
        }
      })

      return propagate
    },
  })

  const wrap = function wrap(event, broadcastWith) {
    var method = eventToCallback(event)
    var preDefined = this[method]

    this[method] = function proxy(...args) {
      let propagate = true
      if (typeof preDefined === 'function') {
        propagate = preDefined.apply(this, args)
      }

      if (propagate !== false) {
        // The first argument should be the broadcast method
        // Which is, in this model simply 'inspect'
        const sender =
          typeof this.broadcastWith === 'function' ? this.broadcastWith() : this.broadcastWith
        broadcastWith && args.unshift(sender)
        args.unshift(method)
        this.notifyObservers.apply(this, args)
      }
    }
  }

  // relay simply notifies observers forwarding any
  // data provided and should be used to bubble up from subnodes
  this.relay &&
    this.relay.forEach((event) => {
      wrap.call(this, event)
    })

  this._broadcast &&
    this._broadcast.forEach((event) => {
      let method = eventToCallback(event)
      let predefined = this[method]
      this[method] = function proxy(...args) {
        const sender = typeof this.inspect === 'function' ? this.inspect() : this.inspect
        args.unshift(sender)
        predefined && predefined.apply(this, args)
      }
    })
  // Transpose takes received broadcasts and maps them on to a local
  // event broker. Any predefined handle for the broadcast will be executed
  // before the broadcast is triggered
  this.transpose &&
    Object.entries(this.transpose).forEach(([event, observable]) => {
      const predefined = this[observable]
      this[observable] = (...args) => {
        predefined && predefined.apply(this, args)
        this.trigger && this.trigger.apply(this, [event].concat(args))
      }
    })
}

export default Observable
