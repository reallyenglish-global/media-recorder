/* eslint-disable no-param-reassign */
import Observable from '../../mixins/Observable'
import Flash from './flash'
// import Base64 from 'crypto-js/enc-base64'

import {
  onStartedRecording,
  onStoppedRecording,
  RESET,
  REMOVE,
  recorderWrapper,
  RECORDER_INITIALIZED,
  RECORDER_STARTED,
  RECORDER_STOPPED,
  onRecorderInitialized,
  onRecorderStarted,
  onRecorderStopped,
} from '../../constants'

var Base64Binary = {
  _keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

  /* will return a  Uint8Array type */
  decodeArrayBuffer(input) {
    var bytes = (input.length / 4) * 3
    var ab = new ArrayBuffer(bytes)
    this.decode(input, ab)

    return ab
  },

  removePaddingChars(input) {
    var lkey = this._keyStr.indexOf(input.charAt(input.length - 1))
    if (lkey === 64) {
      return input.substring(0, input.length - 1)
    }
    return input
  },

  decode(input, arrayBuffer) {
    // get last chars to see if are valid
    input = this.removePaddingChars(input)
    input = this.removePaddingChars(input)

    const bytes = parseInt((input.length / 4) * 3, 10)

    let uarray
    let chr1
    let chr2
    let chr3
    let enc1
    let enc2
    let enc3
    let enc4
    let j = 0

    if (arrayBuffer) uarray = new Uint8Array(arrayBuffer)
    else uarray = new Uint8Array(bytes)

    input = input.replace(/[^A-Za-z0-9+/=]/g, '')

    for (let i = 0; i < bytes; i += 3) {
      // get the 3 octects in 4 ascii chars
      enc1 = this._keyStr.indexOf(input.charAt(j++))
      enc2 = this._keyStr.indexOf(input.charAt(j++))
      enc3 = this._keyStr.indexOf(input.charAt(j++))
      enc4 = this._keyStr.indexOf(input.charAt(j++))

      chr1 = (enc1 << 2) | (enc2 >> 4)
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
      chr3 = ((enc3 & 3) << 6) | enc4

      uarray[i] = chr1
      if (enc3 !== 64) uarray[i + 1] = chr2
      if (enc4 !== 64) uarray[i + 2] = chr3
    }

    return uarray
  },
}
const withRecorder = Symbol('withRecorder')

const decode = (base64, type) => {
  /*
  const words = Base64.parse(base64)
  const decoded = Base64.stringify(words)
  const arr = new Uint8Array([...decoded].map((char) => char.charCodeAt(0)))
  */
  const arr = Base64Binary.decodeArrayBuffer(base64)
  return new Blob([arr], { type })
}

class Swf {
  constructor() {
    this.relay = ['mp3-data']
    Observable.call(this)
    new Flash().addObserver(this, [
      RECORDER_STARTED,
      RECORDER_STOPPED,
      RECORDER_INITIALIZED,
      'mp3-data',
    ])
  }

  static isSupported() {
    return Flash.isSupported()
  }

  [withRecorder](method) {
    this.last = method
    console.log('unregistered recorder', method)
  }

  startRecording() {
    this[withRecorder]('recordStart')
  }

  stopRecording() {
    const duration = this[withRecorder]('recordStop')
    console.log(duration)
  }

  getMp3() {
    const self = this
    const proxy = {
      onMp3Data(base64) {
        const recording = decode(base64, 'audio/mpeg')
        self.notifyObservers(onStoppedRecording, recording)

        console.log('it worked')
        /*
        const audio = document.createElement('audio')
        console.log('audio element created')
        const src = URL.createObjectURL(decode(base64, 'audio/mpeg'))
        console.log('src created')
        audio.src = src
        console.log('src set')
        // document.body.append(audio)
        console.log('appended')
        audio.load()
        console.log('loaded')
        audio.play()
        console.log('played?')
        */

        // self.removeObserver(this)
      },
    }
    Observable.call(proxy)
    this.addObserver(proxy, ['mp3-data'])
    try {
      this[withRecorder]('mp3Data')
    } catch (e) {
      console.log(e)
    }
  }

  [RESET]() {
    this[withRecorder](RESET)
  }

  [REMOVE]() {
    this[withRecorder](RESET)
    this[withRecorder](REMOVE)
    this.removeObservers()
  }

  [onRecorderInitialized](recorder) {
    this[withRecorder] = recorderWrapper(recorder)
  }

  [onRecorderStarted]() {
    this.notifyObservers(onStartedRecording)
  }

  async [onRecorderStopped]() {
    this.getMp3()
    /*
    let recording
    let base64
    try {
      base64 = this[withRecorder]('wavData')
      recording = decode(base64, 'audio/wave')
      const audio = document.createElement('audio')
      const src = URL.createObjectURL(decode(base64, 'audio/wave'))
      audio.src = src
      document.body.append(audio)
      audio.load()
      audio.play()
    } catch (e) {
      console.log('oh-no', e)
    }
    console.log(onStoppedRecording, recording)
    this.notifyObservers(onStoppedRecording, recording)
    */
  }
}
export default Swf
