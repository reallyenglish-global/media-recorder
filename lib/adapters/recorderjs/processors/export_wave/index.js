import encoder from './encoder'

export default ({ sampleRate = 44100 }) => {
  return (audioBuffer) => {
    const promise = new Promise((resolve) => {
      resolve(encoder(audioBuffer, sampleRate))
    })
    return promise
  }
}
