require('.')
import Recorder from '.'
import { mockAdapter } from '../test_support'
import {
  RECORDER_INITIALIZED,
  STARTED_RECORDING,
  STOPPED_RECORDING,
  UNSUPPORTED,
  MOBILE,
  WEB_AUDIO,
  SWF,
  handlerFor,
} from './constants'

const onRecorderInitialized = handlerFor(RECORDER_INITIALIZED)
const onStartedRecording = handlerFor(STARTED_RECORDING)
const onStoppedRecording = handlerFor(STOPPED_RECORDING)
const onUnsupported = handlerFor(UNSUPPORTED)

describe('MediaRecorder', () => {
  describe('standard usage', () => {
    const broadcasts = [RECORDER_INITIALIZED, STARTED_RECORDING, STOPPED_RECORDING]
    const handlers = [onRecorderInitialized, onStartedRecording, onStoppedRecording]

    var recorder
    let observer
    let env
    // eslint-disable-next-line mocha/no-hooks-for-single-case
    before(() => {
      env = mockAdapter(MOBILE)

      observer = {}
      broadcasts.forEach((message) => {
        observer[handlerFor(message)] = sinon.spy()
      })
      recorder = new Recorder()
      recorder.addObserver(observer, broadcasts)
    })

    // eslint-disable-next-line mocha/no-hooks-for-single-case
    after(() => {
      env.uninstall()
      sinon.restore()
      recorder.remove()
      delete window.rels
    })

    it('Relays broadcasts', () => {
      handlers.forEach((name) => {
        recorder[name]()
        expect(observer[name]).to.be.called
      })
    })
  })

  describe('loading suppored adapter', () => {
    context('when rels.mobile is defined on window', () => {
      it('chooses the mobile adapter', () => {
        const env = mockAdapter(MOBILE)
        const recorder = new Recorder()
        expect(recorder.using()).to.eql(MOBILE)
        recorder.remove()
        env.uninstall()
      })
    })

    context('specifying an adapter', () => {
      it('chooses the WEB_AUIDO adapter even though the mobile adapter is supported', () => {
        const env = mockAdapter(MOBILE, WEB_AUDIO)
        const recorder = new Recorder({ adapterName: WEB_AUDIO })

        expect(recorder.using()).to.eql(WEB_AUDIO)

        env.uninstall()
        recorder.remove()
      })
    })

    context('web audio suppoted env', () => {
      it('chooses the recorderjs adapter', () => {
        const env = mockAdapter(WEB_AUDIO)
        const recorder = new Recorder()

        expect(recorder.using()).to.eql(WEB_AUDIO)

        env.uninstall()
        recorder.remove()
      })
    })

    context('flash supported env', () => {
      it('loads the swf Recorder, which is current not supported', () => {
        const clock = sinon.useFakeTimers()
        const env = mockAdapter(SWF)
        const mock = {
          [onUnsupported]: sinon.spy(),
        }

        const recorder = new Recorder({ adapterName: SWF }).addObserver(mock, [UNSUPPORTED])
        clock.tick(1)

        expect(recorder.using()).to.eql(SWF)

        env.uninstall()
        recorder.remove()
        clock.restore()
        sinon.restore()
      })
    })

    context('no supported adapter found', () => {
      it('broadcasts onUnsupported', () => {
        const mock = {
          [onUnsupported]: sinon.spy(),
        }

        const r = new Recorder({ adapterName: 'foo' }).addObserver(mock, [UNSUPPORTED])
        r.startRecording()

        expect(mock[onUnsupported]).to.be.called
      })
    })
  })
})
