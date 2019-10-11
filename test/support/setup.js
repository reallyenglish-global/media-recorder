import jsdom from 'jsdom-global'
import sinon from 'sinon'
import chai from 'chai'
import sinonChai from 'sinon-chai'

jsdom('', {
  url: 'https://localhost',
  pretendToBeVisual: true,
})

chai.should()
chai.use(sinonChai)

if (typeof global !== 'undefined') {
  global.Audio = window.Audio
  global.requestAnimationFrame = window.requestAnimationFrame
  global.expect = chai.expect
  global.sinon = sinon
  global.FileReader = window.FileReader
}

Object.defineProperty(global.window.HTMLMediaElement.prototype, 'play', {
  configurable: true,
  // Define the property getter
  get() {
    setTimeout(() => this.onloadeddata && this.onloadeddata())
    return () => {}
  },
})
Object.defineProperty(global.window.HTMLMediaElement.prototype, 'load', {
  configurable: true,
  // Define the property getter
  get() {
    setTimeout(() => this.onloadeddata && this.onloadeddata())
    return () => {}
  },
})
Object.defineProperty(document, 'elementFromPoint', {
  configurable: true,
  // Define the property getter
  get() {
    return () => {}
  },
})

if (typeof window !== 'undefined') {
  window.expect = chai.expect
  window.sinon = sinon
}
