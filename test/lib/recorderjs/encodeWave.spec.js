var encodeWave = require('../../../lib/recorderjs/encodeWave')
var pcm = require('../../support/fixtures/pcm')

describe('encodeWave', function() {
  describe('encode', function() {
    var halfMaxInt = 32768
    var blob
    var view
    var reader = new FileReader()
    pcm.splice(0, 5, 1, 0.5, 0.0, -0.5, -1)

    before(function(done){
      blob = encodeWave(pcm)
      reader.onload = function(event) {
        view = new DataView(event.target.result)
        done()
      }
      reader.onerror = done
      reader.readAsArrayBuffer(blob)
    })

    it('creates a audio/wav blob', function() {
      expect(blob.type).to.eql('audio/wav')
    })

    it('converts float to int', function() {
      // We dont care if 1.0 turns into -32768
      expect(view.getInt16(45)).to.eql(-32768)
      expect(view.getInt16(47)).to.eql(32768/2)
      expect(view.getInt16(49)).to.eql(0)
      expect(view.getInt16(51)).to.eql(32768/2*-1)
      expect(view.getInt16(53)).to.eql(-32768)
    })
  })

  describe('float to int conversion', function() {
    var view = {}
    before(function() {
      view.setInt16 = sinon.spy()
      encodeWave.floatTo16BitPCM(view, 0, [1.0, 0.5, 0.0, -0.5, -1.0])
    })

    after(function() {
      sinon.reset()
    })

    it('mashes by one more than the maximum short value.', function() {
     expect(view.setInt16).to.be.calledWith(0, 32768, true)
     expect(view.setInt16).to.be.calledWith(2, 32768/2, true)
     expect(view.setInt16).to.be.calledWith(4, 0, true)
     expect(view.setInt16).to.be.calledWith(6, -32768/2, true)
     expect(view.setInt16).to.be.calledWith(8, -32768, true)
    })
  })
})
