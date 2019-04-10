'use strict'

var NUM_CHANNELS = 1
var SAMPLE_RATE = 16000

function writeString(view, offset, string) {
  for (var i = 0; i < string.length; i++){
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

function floatTo16BitPCM(view, offset, input) {
  for (var i = 0; i < input.length; i++, offset+=2) {
    // we do not really care if we clip when the float value is 1?
    var sample = input[i]  * 32768
    view.setInt16(offset, sample, true)
  }
}

/*
  The canonical WAVE format starts with the RIFF header:
  http://soundfile.sapp.org/doc/WaveFormat/

  offset    size
    0         4   ChunkID          Contains the letters "RIFF" in ASCII form
                                  (0x52494646 big-endian form).
    4         4   ChunkSize        36 + SubChunk2Size, or more precisely:
                                  4 + (8 + SubChunk1Size) + (8 + SubChunk2Size)
                                  This is the size of the rest of the chunk
                                  following this number.  This is the size of the
                                  entire file in bytes minus 8 bytes for the
                                  two fields not included in this count:
                                  ChunkID and ChunkSize.
    8         4   Format           Contains the letters "WAVE"
                                  (0x57415645 big-endian form).

    The "WAVE" format consists of two subchunks: "fmt " and "data":
    The "fmt " subchunk describes the sound data's format:

    12        4   Subchunk1ID      Contains the letters "fmt "
                                  (0x666d7420 big-endian form).
    16        4   Subchunk1Size    16 for PCM.  This is the size of the
                                  rest of the Subchunk which follows this number.
    20        2   AudioFormat      PCM = 1 (i.e. Linear quantization)
                                  Values other than 1 indicate some
                                  form of compression.
    22        2   NumChannels      Mono = 1, Stereo = 2, etc.
    24        4   SampleRate       8000, 44100, etc.
    28        4   ByteRate         == SampleRate * NumChannels * BitsPerSample/8
    32        2   BlockAlign       == NumChannels * BitsPerSample/8
                                  The number of bytes for one sample including
                                  all channels. I wonder what happens when
                                  this number isn't an integer?
    34        2   BitsPerSample    8 bits = 8, 16 bits = 16, etc.
              2   ExtraParamSize   if PCM, then doesn't exist
              X   ExtraParams      space for extra parameters

    The "data" subchunk contains the size of the data and the actual sound:

    36        4   Subchunk2ID      Contains the letters "data"
                                  (0x64617461 big-endian form).
    40        4   Subchunk2Size    == NumSamples * NumChannels * BitsPerSample/8
                                  This is the number of bytes in the data.
                                  You can also think of this as the size
                                  of the read of the subchunk following this
                                  number.
    44        *   Data             The actual sound data.

*/

// NOTE - I've dropped support for interleave so this
// only supports single mono buffer
function encodeWave(buffer) {
  var bitSize = 16 // just cause
  var PCM = 1
  var length = buffer.length * bitSize / 8
  var viewBuffer = new ArrayBuffer(44 + length)
  var view = new DataView(viewBuffer)
  var type = 'audio/wav'

  /* RIFF identifier */
  writeString(view, 0, 'RIFF')
  /* RIFF chunk length */
  view.setUint32(4, 36 + length, true)
  /* RIFF type */
  writeString(view, 8, 'WAVE')
  /* format chunk identifier */
  writeString(view, 12, 'fmt ')
  /* format chunk length */
  view.setUint32(16, 16, true)
  /* sample format */
  view.setUint16(20, PCM, true)
  /* channel count */
  view.setUint16(22, NUM_CHANNELS, true)
  /* sample rate */
  view.setUint32(24, SAMPLE_RATE, true)
  /* byte rate (sample rate * block align) */
  view.setUint32(28, (SAMPLE_RATE * bitSize * NUM_CHANNELS) / 8, true)
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, NUM_CHANNELS * bitSize / 8 , true)
  /* bits per sample */
  view.setUint16(34, bitSize, true)
  /* data chunk identifier */
  writeString(view, 36, 'data')
  /* data chunk length */
  view.setUint32(40, length, true)

  floatTo16BitPCM(view, 44, buffer)

  return new Blob([view], { type: type })
}

module.exports = encodeWave;
module.exports.floatTo16BitPCM = floatTo16BitPCM