import { MOBILE, WEB_AUDIO, SWF } from '../../lib/constants'
import Observable from '../../lib/mixins/Observable'

export class MockMediaRecorder {
  constructor() {
    Observable.call(this)
  }

  startRecord() {
    return this
  }

  stopRecord() {
    return this
  }

  play() {
    return this
  }

  stop() {
    return this
  }

  release() {
    return this
  }

  reset() {
    return this
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
