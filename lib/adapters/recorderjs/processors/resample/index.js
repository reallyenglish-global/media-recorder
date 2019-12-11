export default ({ sampleRate = 44100, numChannels = 2 }) => {
  return (audioBuffer) => {
    const promise = new Promise((resolve) => {
      var offlineContext = new window.OfflineAudioContext(
        numChannels,
        audioBuffer.duration * sampleRate,
        sampleRate,
      )
      var source = offlineContext.createBufferSource()

      source.buffer = audioBuffer
      source.start(0)
      source.connect(offlineContext.destination)
      offlineContext.startRendering()
      offlineContext.oncomplete = (event) => {
        resolve(event.renderedBuffer)
      }
    })
    return promise
  }
}
