export const handlerFor = (event) => {
  if (event === undefined) {
    throw new Error('Unknown event constant passed into constants#handlerFor')
  }

  const parts = event.split(/[:|-]/)
  const capitalized = parts.map(
    (part) => part.charAt(0).toUpperCase() + part.substring(1).toLowerCase(),
  )
  return `on${capitalized.join('')}`
}

export const MIME_WAV = 'audio/wav'
export const MIME_MPEG = 'audio/mpeg'

/* from recorder core instance to adapter */
export const RECORDER_STARTED = 'recorder-started'
export const RECORDER_STOPPED = 'recorder-stopped'
export const RECORDER_INITIALIZED = 'recorder-initialized'
export const onRecorderStarted = handlerFor(RECORDER_STARTED)
export const onRecorderStopped = handlerFor(RECORDER_STOPPED)
export const onRecorderInitialized = handlerFor(RECORDER_INITIALIZED)

/* from adapter to media-recorder */
export const MEDIA_STREAM_SOURCE_CREATED = 'media-stream-source:created'
export const STOPPED_RECORDING = 'stopped-recording'
export const STARTED_RECORDING = 'started-recording'

/* from media-recorder */
export const UNSUPPORTED = 'unsupported'
export const onUnsupported = handlerFor(UNSUPPORTED)
/* adapters */
export const WEB_AUDIO = 'WebAudio'
export const MOBILE = 'Mobile'
export const SWF = 'Swf'

// swf external interface
export const MP3_DATA = 'mp3Data'
export const onMp3Data = handlerFor(MP3_DATA)
export const RECORD_STOP = 'recordStop'
export const RECORD_START = 'recordStart'
export const AUDIO_DATA_READY = 'audio-data:ready'
export const onAudioDataReady = handlerFor(AUDIO_DATA_READY)

export const onStartedRecording = handlerFor(STARTED_RECORDING)
export const onStoppedRecording = handlerFor(STOPPED_RECORDING)
export const onMediaStreamSourceCreated = handlerFor(MEDIA_STREAM_SOURCE_CREATED)

/* from adapter down */
export const START_RECORDING = 'startRecording'
export const STOP_RECORDING = 'stopRecording'
export const onStartRecording = handlerFor(START_RECORDING)
export const onStopRecording = handlerFor(STOP_RECORDING)

/* from external */
export const RESET = 'reset'
export const REMOVE = 'remove'
export const RELEASE = 'release'
export const onReset = handlerFor(RESET)
export const onRemove = handlerFor(REMOVE)

export const API = [START_RECORDING, STOP_RECORDING, RESET, REMOVE]

export const recorderWrapper = (receiver) =>
  function withAdapter(method, ...rest) {
    if (!receiver) {
      this.notifyObservers(onUnsupported)
      return receiver
    }
    if (method === 'name') {
      return receiver.constructor.name
    }

    const target = receiver[method]
    const type = typeof target
    switch (method) {
      case undefined:
        return receiver
      case REMOVE:
        target && target.call(receiver)
        receiver = undefined // eslint-disable-line no-param-reassign
        return receiver
      default:
        switch (type) {
          case 'function':
            return receiver[method](...rest)
          default:
            return target
        }
    }
  }
