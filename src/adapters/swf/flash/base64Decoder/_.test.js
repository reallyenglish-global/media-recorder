import decoder from '.'

describe('base64Decoder', () => {
  const testString = 'Man'
  it('decodes base64 encode data', () => {
    const encoded = btoa(testString)
    const uint8 = new Uint8Array(decoder(encoded))
    const decoded = String.fromCharCode(...uint8)

    expect(decoded.replace(/\0/g, '')).to.eql(testString)
  })
})
