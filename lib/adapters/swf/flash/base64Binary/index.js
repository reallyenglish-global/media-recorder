import table from './table'

// https://en.wikipedia.org/wiki/Base64
const sextetsToOctets = (sextets) => {
  const [first, second, third, fourth] = sextets.map((sextet) => table[sextet])
  return [
    (first << 2) | (second >> 4),
    ((second & 15) << 4) | (third >> 2),
    ((third & 3) << 6) | fourth,
  ]
}

const octetLength = (stringOrArray) => {
  return parseInt((stringOrArray.length * 4) / 3, 10)
}

export default (input, type) => {
  const buffer = new ArrayBuffer(octetLength(input))
  const uarray = new Uint8Array(buffer)
  const [...cleanInput] = input.replace(/[^A-Za-z0-9+/]/g, '')
  let index = 0

  for (let i = 0, l = octetLength(cleanInput); i < l; i += 3) {
    const sextets = cleanInput.slice(index, index + 4)
    const octets = sextetsToOctets(sextets)
    uarray.set(octets, i)
    index += 4
  }

  return new Blob([buffer], { type })
}
