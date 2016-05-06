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

// Order of adapters defines fallback order for support
module.exports = {
  'mobile': require('./adapters/mobile'),
  'recorderjs': require('./adapters/recorderjs'),
  'swf': require('./adapters/swf')
};
