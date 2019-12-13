/* eslint-disable */
import {
  MOBILE,
  API,
  START_RECORDING,
  STOP_RECORDING,
  RESET,
  REMOVE,
  STARTED_RECORDING,
  STOPPED_RECORDING,
} from '../../constants'
import { mockAdapterSupportFor } from '../../../test/support'
import Mobile from '.'
let env
describe('MobileAdapter', () => {
  before(() => {
    env = mockAdapterSupportFor(MOBILE)
  })
  after(() => {
    env.uninstall()
  })
  describe('isSupported', () => {
    context('client supports mobile app recording', () => {
      it('returns true', () => {
        expect(Mobile.isSupported()).to.be.true
      })
    })

    context('client does not support mobile app recording', () => {
      it('returns false', () => {
        env.uninstall()
        expect(Mobile.isSupported()).to.be.false
        env = mockAdapterSupportFor(MOBILE)
      })
    })
  })

  describe('supports adapter API', () => {
    it('supports the adapter interface', () => {
      const adapter = new Mobile()
      API.forEach((name) => {
        expect(typeof adapter[name]).to.eql('function')
      })
    })
  })

  describe(START_RECORDING, () => {
    it(`hits ${STARTED_RECORDING}`, () => {
      const observer = { onStartedRecording: sinon.spy() }
      const adapter = new Mobile().addObserver(observer, [STARTED_RECORDING])

      adapter.startRecording()
      expect(observer.onStartedRecording).to.have.been.called
    })
  })

  describe(STOP_RECORDING, () => {
    it(`hits ${STOPPED_RECORDING} with data`, () => {
      const observer = { onStoppedRecording: sinon.spy() }
      const adapter = new Mobile().addObserver(observer, [STOPPED_RECORDING])

      adapter.stopRecording()
      expect(observer.onStoppedRecording).to.have.been.calledWith('data')
    })
  })
})
