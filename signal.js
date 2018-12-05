class Complex {
  constructor(r, i) {
    this.r = r
    this.i = i
  }
  mult(complex) {
    let newR = this.r * complex.r - this.i * complex.i,
      newI = this.i * complex.r + this.r * complex.i
    return new Complex(newR, newI)
  }
  div(complex) {
    if (complex.r ** 2 + complex.i ** 2 != 0) {
      let newR = (this.r * complex.r + this.i * complex.i) / (complex.r ** 2 + complex.i ** 2),
        newI = -(this.r * complex.i - this.i * complex.r) / (complex.r ** 2 + complex.i ** 2)
      return new Complex(newR, newI)
    }
  }
  add(complex) {
    let newR = this.r + complex.r,
      newI = this.i + complex.i
    return new Complex(newR, newI)
  }
  fix(n = 4) {
    function fixPrecision(num, n) {
      let buf = num * 10 ** n
      buf = Math.round(buf)
      buf /= 10 ** n
      return buf
    }
    return new Complex(fixPrecision(this.r, n), fixPrecision(this.i, n))
  }
}

function sigArr(n, xScale, yScale) {
  let sig = []
  while (sig.length < n) {
    sig.push([Math.random() * (xScale[1] - xScale[0]) + xScale[0],
    Math.random() * (yScale[1] - yScale[0]) + yScale[0]
    ])
  }
  return sig
}

function sig(nOrArr, xScale, yScale) {
  return arguments.length == 1 && Array.isArray(arguments[0])
  ? nOrArr.map(sig => new Complex(sig[0], sig[1]))
  : arguments.length == 3 
  ? sigArr(nOrArr, xScale, yScale).map(sig => new Complex(sig[0], sig[1]))
  : undefined
}

// let signals = genSig(basicSignals, 0)
module.exports = {
  sigArr,
  sig,
  Complex
}