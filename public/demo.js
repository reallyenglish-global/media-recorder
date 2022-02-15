var recorder, adapterSelector, record, playback

const recorderObserver = {
  onStoppedRecording: function (waveFile) {
    const url = window.URL.createObjectURL(waveFile)

    record.innerHTML = 'record'

    playback.src = url
    playback.controls = true
  },

  onStartedRecording: function () {
    record.innerHTML = 'stop'
    playback.controls = false
  },
}
const startRecording = () => {
  loadRecorder()
  recorder.startRecording()
}

const stopRecording = () => {
  recorder.stopRecording()
}

const loadRecorder = function () {
  const adapter = adapterSelector.value || undefined

  recorder && recorder.remove()
  recorder = new window.Recorder({ adapter })
  recorder.addObserver(recorderObserver, ['started-recording', 'stopped-recording'])
}
;(function () {
  record = document.querySelector('#record')
  playback = document.getElementById('playback')
  adapterSelector = document.querySelector('#adapter')
  record.addEventListener('click', () => {
    record.innerHTML === 'stop' ? stopRecording() : startRecording()
  })
})()
