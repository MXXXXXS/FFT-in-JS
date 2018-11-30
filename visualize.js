let d3 = Object.assign({}, require('d3-selection'))
let Signal = require('./fft.js')
let {
  signals
} = require('./signal.js')

let inSig = signals
let outSig = new Signal(inSig)

let FFTed = outSig.FFT().output

let amplitude = FFTed.map(val => Math.sqrt(val.r ** 2 + val.i ** 2))
let phase = FFTed.map(val => Math.atan(val.i / val.r))
let real = FFTed.map(val => val.r)
let imagine = FFTed.map(val => val.i)

console.log(`${amplitude}\n${phase}\n${real}\n${imagine}`);

