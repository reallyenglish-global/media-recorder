/* eslint-disable */
import WebAudio from '.'
import { WEB_AUDIO, API } from '../../constants'
import { mockAdapter } from '../../../test_support'
describe('WebAudio', () => {
  context('client supports web audio', () => {
    it('is supported', () => {
      const env = mockAdapter(WEB_AUDIO)
      expect(WebAudio.isSupported()).to.be.true
      env.uninstall()
    })
  })

  context('client does not support web audio', () => {
    it('is not supported', () => {
      const con = window.AudioContext
      delete window.AudioContext
      expect(WebAudio.isSupported()).to.be.false
      window.AudioContext = con
    })
  })

  it('supports the adapter interface', () => {
    const env = mockAdapter(WEB_AUDIO)
    const adapter = new WebAudio()

    API.forEach((method) => expect(typeof adapter[method]).to.eql('function'))
    env.uninstall()
  })
})
