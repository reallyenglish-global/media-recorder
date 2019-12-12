export const STOPPED_PLAYING = 'stopped:playing'
export const MEDIA_STREAM_SOURCE_CREATED = 'media-stream-source:created'
export const RECORDER_INITIALIZED = 'recorder:initialized'
export const STOPPED_RECORDING = 'stopped:recording'
export const STARTED_RECORDING = 'started:recording'
export const UNSUPPORTED = 'unsupported'
export const WEB_AUDIO = 'WebAudio'
export const MOBILE = 'Mobile'
export const SWF = 'Swf'

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
