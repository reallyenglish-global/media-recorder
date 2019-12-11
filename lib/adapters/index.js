import mobile from './mobile'
import recorderjs from './recorderjs'

// 2019.12 we will either remove support for flash (i.e. IE11)
// or implement wave as blob data to onRecording stopped.
// For now, we want to return nothing if neither mobile nore web audio are available
// import swf from './swf'

module.exports = {
  mobile,
  recorderjs,
  // swf,
}
