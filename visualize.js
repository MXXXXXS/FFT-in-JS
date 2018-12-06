let d3 = require('d3')
let Signal = require('./fft.js')
let {
  genSigArr,
  sig
} = require('./signal.js')

//图表样式
let chartStyle = {
  w: 500,
  h: 500,
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

class Once {
  constructor(){
  let finished = false
  let count = (fn) => {
    if (!finished) {
      finished = true
      return fn
    }
    return () => {}
  }
  return count
  }
}

class InSigScatter {
  constructor(chartStyle) {
    let _this = this
    this.once = new Once()
    //初始化图表参数
    this.w = chartStyle.w
    this.h = chartStyle.h
    this.padding = chartStyle.padding
    this.pointSize = chartStyle.pointSize
    //监听事件绑定input输入
    this.userInput = ezBindAll({}, this.whenInputed, this)
    d3.selectAll('input').on('change', function () {
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
    d3.selectAll('input').nodes().forEach(node => {
      if (node.value === '') {
        dataReady = false
      }
    })
    //input参数收集完成
    if (dataReady) {
      //生成用来画散点图的数据
      _this.inputSig = genSigArr(_this.userInput.num,
        [_this.userInput.rMin, _this.userInput.rMax],
        [_this.userInput.iMin, _this.userInput.iMax])
      //初始绘制, 单次执行
      _this.once(_this.genInSigScatter)(_this)
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
      .attr('cx', d => _this.xScale(d[0]))
      .attr('cy', d => _this.yScale(d[1]))
      .attr('r', pointSize)
      .attr("fill", "rgb(149, 180, 54)")
      .merge(circles)
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

let inSigScatter = new InSigScatter(chartStyle)

class FFTedSigBar {
  constructor(chartStyle) {
    let _this = this
    this.once = new Once()
    //初始化图表参数
    this.w = chartStyle.w
    this.h = chartStyle.h
    this.padding = chartStyle.padding
    this.pointSize = chartStyle.pointSize
    d3.select('#generate').on('click', function () {
      let amplitude = d3.select('.amplitude')
      let phase = d3.select('.phase')
      let real = d3.select('.real')
      let imaginary = d3.select('.imaginary')
      let fftSuccessed = _this.fftTheSig(inSigScatter.inputSig, _this)
      console.log(fftSuccessed + '\n' + inSigScatter.inputSig.length)
      if (fftSuccessed) {
        _this.once(() => {
          _this.genOutSigBar(_this.amplitude, amplitude, _this)
          _this.genOutSigBar(_this.phase, phase, _this)
          _this.genOutSigBar(_this.real, real, _this)
          _this.genOutSigBar(_this.imaginary, imaginary, _this)
        })()
        _this.updateOutSigBar(_this.amplitude, amplitude, _this)
        _this.updateOutSigBar(_this.phase, phase, _this)
        _this.updateOutSigBar(_this.real, real, _this)
        _this.updateOutSigBar(_this.imaginary, imaginary, _this)
      }
    })
  }

  fftTheSig(inputSig, _this) {
    if (inputSig && inputSig.length != 0) {
      _this.outSig = new Signal(sig(inputSig))
      _this.FFTed = _this.outSig.FFT().output
      _this.amplitude = _this.FFTed.map(val => Math.sqrt(val.r ** 2 + val.i ** 2))
      _this.phase = _this.FFTed.map(val => Math.atan(val.i / val.r))
      _this.real = _this.FFTed.map(val => val.r)
      _this.imaginary = _this.FFTed.map(val => val.i)
      return true
    } else {
      return false
    }
  }

  genOutSigBar(dataset, el, _this) {
    let w = _this.w
    let h = _this.h
    _this.xScale = d3.scaleBand()
      .domain(d3.range(dataset.length))
      .rangeRound([0, w])
      .paddingInner(.05)
    let absMaxY = Math.max(-d3.min(dataset), d3.max(dataset))
    _this.yScale = d3.scaleLinear()
      .domain([-absMaxY, absMaxY])
      .range([0, h])

    let svg = el
      .append('svg')
      .attr('width', w)
      .attr('height', h)

    svg.selectAll('rect')
      .data(dataset)
      .enter()
      .append('rect')
      .attr('x', (d, i) => _this.xScale(i))
      .attr('y', d => _this.yScale(Math.min(0, -d)))
      .attr('width', _this.xScale.bandwidth())
      .attr('height', d => Math.abs(_this.yScale(d) - _this.yScale(0)))
      .attr('fill', 'rgb(149, 180, 54)')

    svg.selectAll("text")
      .data(dataset)
      .enter()
      .append("text")
      .text(function (d) {
        return d;
      })
      .attr("text-anchor", "start")
      .attr("x", (d, i) => _this.xScale(i) + _this.xScale.bandwidth() / 2)
      .attr("y", d => _this.yScale(Math.min(0, -d)) + 14)
      .attr('transform', (d, i) => `rotate(90, ${_this.xScale(i) + _this.xScale.bandwidth() / 2}, ${_this.yScale(Math.min(0, -d)) + 14})`)
      .attr("font-family", "sans-serif")
      .attr("font-size", "14px")
      .attr("fill", "white");
  }
  updateOutSigBar(dataset, el, _this) {
    let svg = el.select('svg')
    let w = _this.w
    let h = _this.h
    _this.xScale = d3.scaleBand()
      .domain(d3.range(dataset.length))
      .rangeRound([0, w])
      .paddingInner(.05)
    let absMaxY = Math.max(-d3.min(dataset), d3.max(dataset))
    _this.yScale = d3.scaleLinear()
      .domain([-absMaxY, absMaxY])
      .range([0, h])

    let bar = svg.selectAll('rect')
      .data(dataset)
      bar
      .enter()
      .append('rect')
      .attr('x', (d, i) => _this.xScale(i))
      .attr('y', d => _this.yScale(Math.min(0, -d)))
      .attr('width', _this.xScale.bandwidth())
      .attr('height', d => Math.abs(_this.yScale(d) - _this.yScale(0)))
      .attr('fill', 'rgb(149, 180, 54)')
      .merge(bar)
      .transition()
      .duration(1000)
      .attr('x', (d, i) => _this.xScale(i))
      .attr('y', d => _this.yScale(Math.min(0, -d)))
      .attr('width', _this.xScale.bandwidth())
      .attr('height', d => Math.abs(_this.yScale(d) - _this.yScale(0)))
      .attr('fill', 'rgb(149, 180, 54)')
      
      bar.exit()
      .transition()
      .attr('x', (d, i) => _this.xScale(dataset.length))
      .remove()

      let text = svg.selectAll("text")
      .data(dataset)
      text
      .enter()
      .append("text")
      .text(function (d) {
        return d;
      })
      .attr("text-anchor", "start")
      .attr("x", (d, i) => _this.xScale(i) + _this.xScale.bandwidth() / 2)
      .attr("y", d => _this.yScale(Math.min(0, -d)) + 14)
      .attr('transform', (d, i) => `rotate(90, ${_this.xScale(i) + _this.xScale.bandwidth() / 2}, ${_this.yScale(Math.min(0, -d)) + 14})`)
      .attr("font-family", "sans-serif")
      .attr("font-size", "14px")
      .attr("fill", "white")
      .merge(text)
      .transition()
      .duration(1000)
      .attr("text-anchor", "start")
      .attr("x", (d, i) => _this.xScale(i) + _this.xScale.bandwidth() / 2)
      .attr("y", d => _this.yScale(Math.min(0, -d)) + 14)
      .attr('transform', (d, i) => `rotate(90, ${_this.xScale(i) + _this.xScale.bandwidth() / 2}, ${_this.yScale(Math.min(0, -d)) + 14})`)
      .attr("font-family", "sans-serif")
      .attr("font-size", "14px")
      .attr("fill", "white")

      text.exit()
      .transition()
      .attr('x', (d, i) => _this.xScale(dataset.length))
      .remove()

  }
}

new FFTedSigBar(chartStyle)