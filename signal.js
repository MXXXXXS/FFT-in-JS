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
let basicSignals = [
    new Complex(1, 3),
    new Complex(1, 4),
    new Complex(5, 1),
    new Complex(-1, 5),
    new Complex(-1, 9),
    new Complex(-1, -2),
    new Complex(6, -1),
    new Complex(9, -5),
]
function genSig(sig, n) {
  function longer(n) {
    if (n > 0) {
      sig = sig.concat(sig)
      n--
      longer(n)
    }
    return sig
  }
  return longer(n)
}
let signals = genSig(basicSignals, 0)
module.exports = {
    signals,
    Complex
}