/* eslint-disable */
var encodeWave = require('.')
var { pcm } = require('../../../../../../test_support')

describe('encodeWave', function () {
  describe('encode', function () {
    it('creates a audio/wav blob', function () {
      const blob = encodeWave(pcm)
      expect(blob.type).to.eql('audio/wav')
    })
  })

  describe('float to int conversion', function () {
    var view = {}
    before(function () {
      view.setInt16 = sinon.spy()
      encodeWave.floatTo16BitPCM(view, 0, [1.0, 0.5, 0.0, -0.5, -1.0])
    })

    after(function () {
      sinon.restore()
    })

    it('mashes by one more than the maximum short value.', function () {
      expect(view.setInt16).to.be.calledWith(0, 32768, true)
      expect(view.setInt16).to.be.calledWith(2, 32768 / 2, true)
      expect(view.setInt16).to.be.calledWith(4, 0, true)
      expect(view.setInt16).to.be.calledWith(6, -32768 / 2, true)
      expect(view.setInt16).to.be.calledWith(8, -32768, true)
    })
  })
})
