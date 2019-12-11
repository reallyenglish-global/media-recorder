import lolex from 'lolex'
import Recorder from '.'
import adapters from './adapters'

import {
  RECORDER_INITIALIZED,
  STARTED_RECORDING,
  STOPPED_RECORDING,
  STOPPED_PLAYING,
  UNSUPPORTED,
  handlerFor,
} from './constants'

const onRecorderInitialized = handlerFor(RECORDER_INITIALIZED)
const onStartedRecording = handlerFor(STARTED_RECORDING)
const onStoppedRecording = handlerFor(STOPPED_RECORDING)
const onStoppedPlaying = handlerFor(STOPPED_PLAYING)
const onUnsupported = handlerFor(UNSUPPORTED)
describe('MediaRecorder', () => {
  describe('standard usage', () => {
    const broadcasts = [RECORDER_INITIALIZED, STARTED_RECORDING, STOPPED_RECORDING, STOPPED_PLAYING]
    const handlers = [
      onRecorderInitialized,
      onStartedRecording,
      onStoppedRecording,
      onStoppedPlaying,
    ]

    var recorder
    let observer

    // eslint-disable-next-line mocha/no-hooks-for-single-case
    before(() => {
      window.rels = {
        mobile: {
          recorder() {
            this.addObserver = () => {}
            this.release = () => {}
          },
        },
      }

      observer = {}
      broadcasts.forEach((message) => {
        observer[handlerFor(message)] = sinon.spy()
      })
      recorder = new Recorder({})
      recorder.addObserver(observer, broadcasts)
    })

    // eslint-disable-next-line mocha/no-hooks-for-single-case
    after(() => {
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
        window.rels = {
          mobile: {
            recorder() {
              this.addObserver = () => {}
            },
          },
        }
        const recorder = new Recorder({})

        expect(recorder.using()).to.eql(adapters.mobile.prototype.name)

        delete window.rels
      })
    })

    context('when AudioContext and mediaDevices are available', () => {
      it('chooses the recorderjs adapter', () => {
        const con = window.AudioContext
        const dev = navigator.mediaDevices

        navigator.mediaDevices = {
          getUserMedia() {},
        }

        window.AudioContext = () => {}
        const recorder = new Recorder({})

        expect(recorder.using()).to.eql(adapters.recorderjs.prototype.name)

        window.AudioContext = con
        navigator.mediaDevices = dev
      })
    })

    context('flash fallback', () => {})

    context('no supported adapter found', () => {
      it('broadcasts onUnsupported', () => {
        const clock = lolex.install()
        const mock = {
          [onUnsupported]: sinon.spy(),
        }
        new Recorder({}).addObserver(mock, [UNSUPPORTED])
        clock.tick(1)

        expect(mock[onUnsupported]).to.be.called
      })
    })
  })
})
