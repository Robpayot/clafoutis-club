// https://en.wikipedia.org/wiki/Linear_interpolation
export function lerp(x, y, t) {
  return (1 - t) * x + t * y
}

export function distance(x1, y1, x2, y2) {
  const a = x1 - x2
  const b = y1 - y2

  return Math.sqrt(a * a + b * b)
}

export function roundTo(val, dec) {
  return Math.floor(val * dec) / dec
}

export function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}
