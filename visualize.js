let d3 = require('d3')
let Signal = require('./fft.js')
let {
  sigArr,
  sig
} = require('./signal.js')

let inSig
let outSig
let FFTed
let amplitude
let phase
let real
let imaginary

//图表样式
let chartStyle = {
  w: 700,
  h: 700,
  padding: 80,
  pointSize: 5,

}
//工具函数
let ezBindAll = (obj, fn, _this) => {
  return new Proxy(obj, {
    set: function (target, key, val) {
      let oldVal = target[key]
      let newVal = val
      target[key] = val
      fn(newVal, oldVal, key, _this)
      return true
    }
  })
}

let once = (function () {
  let n = 1
  function count(fn) {
    if (n === 1) {
      n = 0
      return fn
    }
    return () => {}
  }
  return count
})()



class InSigScatter {
  constructor(chartStyle) {
    let _this = this
    //初始化图表参数
    this.w = chartStyle.w
    this.h = chartStyle.h
    this.padding = chartStyle.padding
    this.pointSize = chartStyle.pointSize
    //监听事件绑定input输入
    this.userInput = ezBindAll({}, this.whenInputed, this)
    this.inputs = d3.selectAll('input')
    this.inputs.on('change', function () {
      _this.userInput[this.id] = parseFloat(this.value)
    })
    //创建svg
    this.inSigScatter = d3.select('.input-signal')
    this.inSigScatter
      .append('svg')
      .attr('width', this.w)
      .attr('height', this.h)
    this.svg = this.inSigScatter.select('svg')
  }

  whenInputed(newVal, oldVal, id, _this) {
    if (newVal != oldVal) {
      //_this.userInput的key对应input的id, 用来绑定
      document.querySelector(`#${id}`).value = newVal
      _this.updateChart(_this, id, newVal)
    }
  }

  updateChart(_this, id, newVal) {
    //收集input的参数, 收集满时开始绘制
    let dataReady = true
    _this.inputs.nodes().forEach(node => {
      if (node.value === '') {
        dataReady = false
      } else {
        _this[id] = newVal
      }
    })
    //input参数收集完成
    if (dataReady) {
      _this.inputSig = sigArr(_this.num, [_this.rMin, _this.rMax], [_this.iMin, _this.iMax])
      console.log(_this.inputSig)
      //初始绘制, 单此执行
      once(_this.genInSigScatter)(_this)
      //变换数据点
      _this.updateInSigScatter(_this)
    }
  }

  updateInSigScatter(_this) {
    let svg = _this.svg
    let w = _this.w
    let h = _this.h
    //让边缘的点和坐标轴之间保留空隙
    let padding = _this.padding
    let pointSize = _this.pointSize
    _this.xScale
      .domain([d3.min(_this.inputSig, d => d[0]), d3.max(_this.inputSig, d => d[0])])
    _this.yScale
      .domain([d3.min(_this.inputSig, d => d[1]), d3.max(_this.inputSig, d => d[1])])

    let circles = svg.selectAll('circle')
      .data(_this.inputSig)
    circles.enter()
      .append('circle')
      .transition()
      .duration(1000)
      .attr('cx', d => _this.xScale(d[0]))
      .attr('cy', d => _this.yScale(d[1]))
      .attr('r', pointSize)
      .attr("fill", "rgb(149, 180, 54)")

    circles.exit()
      .transition()
      .duration(1000)
      .attr('cx', d => _this.xScale(d[0]) + w)
      .attr('cy', d => _this.yScale(d[1]) + h)
      .remove()

    d3.select('.x')
      .transition()
      .duration(1000)
      .attr('transform', 'translate(0, ' + (h - padding / 2) + ')')
      .call(_this.xAxis)
    d3.select('.y')
      .transition()
      .duration(1000)
      .attr('transform', `translate(${padding / 2}, 0)`)
      .call(_this.yAxis)
  }

  genInSigScatter(_this) {
    let svg = _this.svg
    let w = _this.w
    let h = _this.h
    //让边缘的点和坐标轴之间保留空隙
    let padding = _this.padding
    let pointSize = _this.pointSize
    //初始化scale
    _this.xScale = d3.scaleLinear()
      .domain([d3.min(_this.inputSig, d => d[0]), d3.max(_this.inputSig, d => d[0])])
      .range([padding, w - padding])
    _this.yScale = d3.scaleLinear()
      .domain([d3.min(_this.inputSig, d => d[1]), d3.max(_this.inputSig, d => d[1])])
      .range([h - padding, padding])
    //添加点
    svg.selectAll('circle')
      .data(_this.inputSig)
      .enter()
      .append('circle')
      .attr('cx', d => _this.xScale(d[0]))
      .attr('cy', d => _this.yScale(d[1]))
      .attr('r', pointSize)
      .attr("fill", "rgb(149, 180, 54)")
    //初始化坐标轴
    _this.xAxis = d3.axisBottom().scale(_this.xScale)
    _this.yAxis = d3.axisLeft().scale(_this.yScale)
    //添加坐标轴
    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0, ' + (h - padding / 2) + ')')
      .call(_this.xAxis)
    svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', `translate(${padding / 2}, 0)`)
      .call(_this.yAxis)
  }
}

Window.inSigScatter = new InSigScatter(chartStyle)

function transInSigScatter(inSigArr) {
  let w = 800; //x轴长
  let h = 800; //y轴长
  let padding = 100; //让边缘的点显示完全
  let pointSize = 4;
  let xScale = d3.scaleLinear()
    .domain([d3.min(inSigArr, d => d[0]), d3.max(inSigArr, d => d[0])])
    .range([padding, w - padding]);
  let yScale = d3.scaleLinear()
    .domain([d3.min(inSigArr, d => d[1]), d3.max(inSigArr, d => d[1])])
    .range([h - padding, padding]);
  let chart = d3.select('.input-signal')
  chart.selectAll('circle')
    .data(inSigArr)
    .enter()
    .append('circle')
    .attr('cx', d => xScale(d[0]))
    .attr('cy', d => yScale(d[1]))
    .attr('r', pointSize)
    .attr("fill", "rgb(149, 180, 54)")

  chart.selectAll('circle')
    .data(inSigArr)
    .exit()
  // chart.selectAll("text")
  //   .data(inSigArr)
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
  xAxis.scale(xScale);
  chart.select('.xAxis')
    .transition()
    .duration(1000)
    .call(xScale)
  yAxis.scale(yScale);
  chart.select('.yAxis')
    .transition()
    .duration(1000)
    .call(yScale)

}

function genOutSig() {
  if (!userInput) {
    genInSig()
  }
  outSigBar(userInput)
}

function outSigBar(inSig) {
  outSig = new Signal(sig(inSig))
  FFTed = outSig.FFT().output //FFT变换后的信号
  amplitude = FFTed.map(val => Math.sqrt(val.r ** 2 + val.i ** 2))
  phase = FFTed.map(val => Math.atan(val.i / val.r))
  real = FFTed.map(val => val.r)
  imaginary = FFTed.map(val => val.i)

  console.log(`${amplitude}\n${phase}\n${real}\n${imaginary}`);

  let w = 500
  let h = 500

  bar(amplitude, '.amplitude')

  function bar(dataset, el) {
    let xScale = d3.scaleBand()
      .domain(d3.range(dataset.length))
      .rangeRound([0, w])
      .paddingInner(.05)

    let yScale = d3.scaleLinear()
      .domain([0, d3.max(dataset)])
      .range([0, h])

    let chart = d3.select(el)
      .append('svg')
      .attr('width', w)
      .attr('height', h)

    chart.selectAll('rect')
      .data(dataset)
      .enter()
      .append('rect')
      .attr('x', (d, i) => xScale(i))
      .attr('y', d => h - yScale(d))
      .attr('width', xScale.bandwidth())
      .attr('height', d => yScale(d))
      .attr('fill', 'rgb(149, 180, 54)')

    chart.selectAll("text")
      .data(dataset)
      .enter()
      .append("text")
      .text(function (d) {
        return d;
      })
      .attr("text-anchor", "middle")
      .attr("x", (d, i) => xScale(i) + xScale.bandwidth() / 2)
      .attr("y", d => h - yScale(d) + 14)
      .attr("font-family", "sans-serif")
      .attr("font-size", "14px")
      .attr("fill", "white");
  }
}