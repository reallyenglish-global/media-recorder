// modified from https://gist.github.com/htchaan/108b7aa6b71eb03e38019e64450ea095

const TABLE = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
  G: 6,
  H: 7,
  I: 8,
  J: 9,
  K: 10,
  L: 11,
  M: 12,
  N: 13,
  O: 14,
  P: 15,
  Q: 16,
  R: 17,
  S: 18,
  T: 19,
  U: 20,
  V: 21,
  W: 22,
  X: 23,
  Y: 24,
  Z: 25,
  a: 26,
  b: 27,
  c: 28,
  d: 29,
  e: 30,
  f: 31,
  g: 32,
  h: 33,
  i: 34,
  j: 35,
  k: 36,
  l: 37,
  m: 38,
  n: 39,
  o: 40,
  p: 41,
  q: 42,
  r: 43,
  s: 44,
  t: 45,
  u: 46,
  v: 47,
  x: 48,
  w: 49,
  y: 50,
  z: 51,
  0: 52,
  1: 53,
  2: 54,
  3: 55,
  4: 56,
  5: 57,
  6: 58,
  7: 59,
  8: 60,
  9: 61,
  '+': 62,
  '/': 63,
}
const decode = (input) => {
  const debuffered = input.replace(/=/g, '')
  const bytes = parseInt((debuffered.length / 4) * 3, 10)

  let chr1
  let chr2
  let chr3
  let enc1
  let enc2
  let enc3
  let enc4
  let j = 0

  const cleaned = debuffered.replace(/[^A-Za-z0-9+/=]/g, '')
  const ab = new ArrayBuffer((input.length / 4) * 3)
  const uarray = new Uint8Array(ab)

  for (let i = 0; i < bytes; i += 3) {
    // get the 3 octects in 4 ascii chars
    enc1 = TABLE[cleaned.charAt(j++)]
    enc2 = TABLE[cleaned.charAt(j++)]
    enc3 = TABLE[cleaned.charAt(j++)]
    enc4 = TABLE[cleaned.charAt(j++)]

    chr1 = (enc1 << 2) | (enc2 >> 4)
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
    chr3 = ((enc3 & 3) << 6) | enc4

    uarray[i] = chr1
    if (enc3 !== 64) uarray[i + 1] = chr2
    if (enc4 !== 64) uarray[i + 2] = chr3
  }

  return uarray
}

export default decode
