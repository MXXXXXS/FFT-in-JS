let {
  signals,
  Complex
} = require('./signal.js')

function W(k, n, N) {
  let r = Math.cos(-2 * Math.PI / N * k * n),
    i = Math.sin(-2 * Math.PI / N * k * n)
  return new Complex(r, i)
}
class Signal {
  constructor(arr = []) {
    this.output = (arr => {
      let legal = (arr => {
        let isLegal
        if (Array.isArray(arr)) {
          isLegal = true
          for (let i = 0; i < arr.length; i++) {
            if (isNaN(arr[i]) === !(arr[i] instanceof Complex)) {
              isLegal = false
              break
            }
          }
        } else {
          isLegal = false
        }
        return isLegal
      })(arr)
      if (legal) {
        function complele(arr) {
          if (Math.log2(arr.length) % 1 != 0) {
            arr.push(0)
            complele(arr)
          }
          return arr.map(val => val instanceof Complex ? val : new Complex(val, 0))
        }
        return complele(arr)
      } else {
        return []
      }
    })(arr)
    this.N = this.output.length
  }
  show() {
    return JSON.stringify(this.output)
  }
  split() {
    let arr = this.output
    this.x0 = arr.filter((val, index) =>
      index % 2 === 0
    )
    this.x1 = arr.filter((val, index) =>
      index % 2 === 1
    )
    this.X0 = new Signal((new Signal(this.x0)).FFT().output)
    this.X1 = new Signal((new Signal(this.x1)).FFT().output)
  }
  DFT() {
    let xn = this.output
    let result = xn.map((useless, k) =>
      xn.map((x, n, arr) =>
        W(k, n, arr.length)
        .mult(x))
      .reduce((acc, cur) => acc.add(cur))
      .fix()
    )
    return new Signal(result)
  }
  IDFT() {
    let Xk = this.output
    let result = Xk.map((useless, n, Arr) =>
      Xk.map((X, k, arr) =>
        W(-k, n, arr.length)
        .mult(X))
      .reduce((acc, cur) => acc.add(cur)).div(new Complex(Arr.length, 0))
      .fix()
    )
    return new Signal(result)
  }
  FFT() {
    if (this.N > 2) {
      this.split()
    } else {
      this.X0 = new Signal([this.output[0]])
      this.X1 = new Signal([this.output[1]])
    }
    return new Signal(this.zip())
  }
  zip() {
    let N = this.N
    let butterfly = (X0, X1, evenodd) =>
      X0.map((val, k) =>
        val
        .add(X1[k]
          .mult(W(k, 1, N))
          .mult(new Complex(evenodd, 0)))
        .fix())
    return butterfly(this.X0.output, this.X1.output, 1).concat(butterfly(this.X0.output, this.X1.output, -1))
  }
  IFFT() {
    let N = this.N
    let adj = (new Signal(this.output.map(val => new Complex(val.r, -val.i)))).FFT()
    return new Signal((new Signal(adj.output.map(val => new Complex(val.r, -val.i)))).output.map(val => val.div(new Complex(N, 0)).fix()))
  }
}
let compleledSignal = new Signal(signals)
// console.time('FFT')
// console.log(compleledSignal.FFT().N);
// console.timeEnd('FFT')
// console.time('DFT')
// console.log(compleledSignal.DFT().N);
// console.timeEnd('DFT')
console.time('FFT&IFFT')
console.log(compleledSignal.FFT().IFFT().N);
console.timeEnd('FFT&IFFT')