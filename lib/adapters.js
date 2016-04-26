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
 */

module.exports = {
  'swf': require('./adapters/swf'),
  'recorderjs': require('./adapters/recorderjs'),
  'cordova': require('./adapters/cordova')
};
