import table from './table'

// https://en.wikipedia.org/wiki/Base64
const sextetsToOctets = (sextets) => {
  const [first, second, third, fourth] = sextets.map((sextet) => table[sextet])
  const octets = [
    (first << 2) | (second >> 4),
    ((second & 15) << 4) | (third >> 2),
    ((third & 3) << 6) | fourth,
  ]

  return octets
}

const octetLength = (stringOrArray) => {
  return Math.ceil(parseInt((stringOrArray.length / 4) * 3, 10) / 3) * 3
}

export default (input) => {
  const [...cleanInput] = input.replace(/[^A-Za-z0-9+/]/g, '')
  const length = octetLength(cleanInput)
  const buffer = new ArrayBuffer(length)
  const view = new Uint8Array(buffer)
  let index = 0

  for (let i = 0; i < length; i += 3) {
    const sextets = cleanInput.slice(index, index + 4)
    const octets = sextetsToOctets(sextets)
    view.set(octets, i)
    index += 4
  }

  return buffer
}
