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
let sigArr = [
    [3.5, 23],
    [2.9, 6],
    [26, 49],
    [5.6, 77],
    [35,44],
    [4.3, 6.3],
    [34,26.3],
    [36.3, 22],
    [32, 23],
    [3.3, 65],
    [3.5, 4.3],
    [5.3, 15],
    [31.4, 24.6],
    [14, 3],
    [3.2, 13],
    [36,48]
]

let signals = sigArr.map(sig => new Complex(sig[0], sig[1]))
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
// let signals = genSig(basicSignals, 0)
module.exports = {
    sigArr,
    signals,
    Complex
}