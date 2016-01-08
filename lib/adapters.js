'use strict';

/*
 * Adapters to mixin support for different recording backends.
 *
 * API:
 * - #startRecording
 * - #stopRecording
 * - #startPlaying
 * - #stopPlaying
 * - #remove
 *
 * Need to consider removing / changing in favour of better state determination
 * - #canPlay
 * - #isRecording
 */

module.exports = {
  'swf': require('./adapters/swf'),
  'recorderjs': require('./adapters/recorderjs')
};
