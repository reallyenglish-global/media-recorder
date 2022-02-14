import { handlerFor, MOBILE, WEB_AUDIO, SWF } from '../../src/constants'
import Observable from '../../src/mixins/Observable'
import { ERROR, RECORDING_STOPPED, RECORDING_STARTED } from '../../src/adapters/mobile'

const onRecordingStarted = handlerFor(RECORDING_STARTED)
const onRecordingStopped = handlerFor(RECORDING_STOPPED)
const onError = handlerFor(ERROR)

export class MockMediaRecorder {
  constructor() {
    Observable.call(this)
  }

  startRecord() {
    this.notifyObservers(onRecordingStarted)
    return this
  }

  stopRecord() {
    this.notifyObservers(onRecordingStopped, 'data')
    return this
  }

  release() {
    return this
  }

  reset() {
    return this
  }

  makeError() {
    this.notifyObservers(onError, new Error('fake error'))
  }
}

export const mockAdapterSupportFor = (...adapters) => {
  const mock = {
    uninstall() {
      adapters.forEach((adapter) => {
        switch (adapter) {
          case MOBILE:
            delete window.rels
            break
          case WEB_AUDIO:
            window.AudioContext = this.con
            navigator.mediaDevices = this.dev
            delete this.con
            delete this.dev
            break
          case SWF:
            window.ActiveXObject = this.axo
            delete this.axo
            break
          default:
          // noop
        }
      })
    },
  }

  adapters.forEach((adapter) => {
    switch (adapter) {
      case MOBILE:
        window.rels = {
          mobile: {
            recorder: MockMediaRecorder,
          },
        }
        break
      case WEB_AUDIO:
        mock.con = window.AudioContext
        mock.dev = navigator.mediaDevices
        window.AudioContext = () => {}
        navigator.mediaDevices = {
          getUserMedia() {},
        }
        break
      case SWF:
        mock.axo = window.ActiveXObject
        window.ActiveXObject = function FakeActiveXObject() {}
        break
      default:
      // noop
    }
  })

  return mock
}
