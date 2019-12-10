import encodeWave from '../../recorderjs/encodeWave'

export default ({ sampleRate = 44100 }) => {
  return (audioBuffer) => {
    const promise = new Promise((resolve) => {
      resolve(encodeWave(audioBuffer, sampleRate))
    })
    return promise
  }
}
