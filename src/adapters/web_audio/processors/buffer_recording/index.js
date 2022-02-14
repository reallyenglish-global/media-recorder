export default ({ sampleRate = 44100 }) => {
  return (recorder) => {
    const promise = new Promise((resolve) => {
      recorder.getBuffer((buffers) => {
        var numChannels = buffers.length
        var duration = Math.max(buffers[0].length, sampleRate)

        var offlineContext = new window.OfflineAudioContext(numChannels, duration, sampleRate)
        var buffer = offlineContext.createBuffer(numChannels, duration, sampleRate)

        for (let channel = 0; channel < buffers.length; channel++) {
          buffer.getChannelData(channel).set(buffers[channel])
        }
        resolve(buffer)
      })
    })
    return promise
  }
}
