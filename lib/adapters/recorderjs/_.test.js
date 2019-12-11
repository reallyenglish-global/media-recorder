/* eslint-disable */
import RecorderJsAdapter from '.'

describe('RecorderJsAdapter', () => {
  var adapterApi = ['startRecording', 'stopRecording', 'startPlaying', 'stopPlaying', 'reset']

  var adapter
  var con
  var dev
  beforeEach(() => {
    con = window.AudioContext
    dev = navigator.mediaDevices

    window.AudioContext = () => {
      this.fake = 'fake'
    }
    navigator.mediaDevices = {
      getUserMedia() {},
    }
    adapter = new RecorderJsAdapter()
  })

  afterEach(() => {
    window.AudioContext = con
    navigator.mediaDevices = dev
  })

  context('client supports web audio', () => {
    it('is supported', () => {
      expect(RecorderJsAdapter.isSupported()).to.be.true
    })
  })

  it('supports the adapter interface', () => {
    adapterApi.forEach((name) => expect(typeof adapter[name]).to.eql('function'))
  })
})
