let d3 = Object.assign({}, require('d3-selection'), require('d3-scale'), require('d3-array'), require('d3-axis'))
let Signal = require('./fft.js')
let {
  sigArr,
  signals
} = require('./signal.js')

let inSig = signals
let outSig = new Signal(inSig)

let FFTed = outSig.FFT().output //FFT变换后的信号

let amplitude = FFTed.map(val => Math.sqrt(val.r ** 2 + val.i ** 2))
let phase = FFTed.map(val => Math.atan(val.i / val.r))
let real = FFTed.map(val => val.r)
let imagine = FFTed.map(val => val.i)

console.log(`${amplitude}\n${phase}\n${real}\n${imagine}`);

let w = 500 //x轴长
let h = 400 //y轴长
let padding = 50  //让边缘的点显示完全
let pointSize = 4

let xScale = d3.scaleLinear()
  .domain([d3.min(sigArr, d => d[0]), d3.max(sigArr, d => d[0])])
  .range([padding, w - padding])
let yScale = d3.scaleLinear()
  .domain([d3.min(sigArr, d => d[1]), d3.max(sigArr, d => d[1])])
  .range([h - padding, padding])

let chart = d3.select('.input-signal')
  .append('svg')
  .attr('width', w)
  .attr('height', h)

chart.selectAll('circle')
  .data(sigArr)
  .enter()
  .append('circle')
  .attr('cx', d => xScale(d[0]))
  .attr('cy', d => yScale(d[1]))
  .attr('r', pointSize)
  .attr("fill", "rgb(149, 180, 54)");

// chart.selectAll("text")
//   .data(sigArr)
//   .enter()
//   .append("text")
//   .text(function (d) {
//     return d[0] + "," + d[1];
//   })
//   .attr('transform', `translate(${pointSize + 2}, ${pointSize / 2})`)
//   .attr("x", function (d) {
//     return xScale(d[0]);
//   })
//   .attr("y", function (d) {
//     return yScale(d[1]);
//   })
//   .attr("font-family", "sans-serif")
//   .attr("font-size", "14px")
//   .attr("fill", "rgb(149, 180, 54)");

let xAxis = d3.axisBottom()
xAxis.scale(xScale)
chart.append('g')
  .attr('class', 'axis')
  .attr('transform', 'translate(0, ' + (h - padding / 2) + ')')
  .call(xAxis)
  
  let yAxis = d3.axisLeft()
  yAxis.scale(yScale)
  chart.append('g')
  .attr('class', 'axis')
  .attr('transform', `translate(${padding / 2}, 0)`)
  .call(yAxis)