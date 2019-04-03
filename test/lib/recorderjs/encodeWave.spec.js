var encodeWave = require('../../../lib/recorderjs/encodeWave')

var fakeBytes = Array.apply(null, Array(40)).map(function() {
  return Math.round(Math.random() * 40);
});

describe('encodeWave', function() {
  it('returns a blob from a byte array', function() {
    var result = encodeWave(fakeBytes)

    expect(result.type).to.eql('audio/wav')
    expect(result.size).to.eql(124) // length * bitSize / 8 + 44
  })
})