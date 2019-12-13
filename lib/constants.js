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
/* from recorder core instance to adapter */
export const RECORDER_STARTED = 'recorder:started'
export const RECORDER_STOPPED = 'recorder:stopped'
export const RECORDER_INITIALIZED = 'recorder:initialized'
export const onRecorderStarted = handlerFor(RECORDER_STARTED)
export const onRecorderStopped = handlerFor(RECORDER_STOPPED)
export const onRecorderInitialized = handlerFor(RECORDER_INITIALIZED)

/* from adapter to media-recorder */
export const MEDIA_STREAM_SOURCE_CREATED = 'media-stream-source:created'
export const STOPPED_RECORDING = 'stopped:recording'
export const STARTED_RECORDING = 'started:recording'

/* from media-recorder */
export const UNSUPPORTED = 'unsupported'

/* adapters */
export const WEB_AUDIO = 'WebAudio'
export const MOBILE = 'Mobile'
export const SWF = 'Swf'

export const onStartedRecording = handlerFor(STARTED_RECORDING)
export const onStoppedRecording = handlerFor(STOPPED_RECORDING)
export const onMediaStreamSourceCreated = handlerFor(MEDIA_STREAM_SOURCE_CREATED)

export const START_RECORDING = 'startRecording'
export const STOP_RECORDING = 'stopRecording'
export const RESET = 'reset'
export const REMOVE = 'remove'

export const API = [START_RECORDING, STOP_RECORDING, RESET, REMOVE]

export const recorderWrapper = (receiver) => (method, ...rest) => {
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
