let d3 = Object.assign({}, require('d3-selection'), require('d3-axis'))

let chart = {
  width: 500,
  height: 400,
  margins: {
    top: 30,
    left: 30,
    right: 30,
    bottom: 30
  },
  x,
  y,
  data,
  color,

}

class LineChart {
  constructor(el, chart) {
    this.el = el
    let _chart = JSON.parse(JSON.stringify(chart))
    let _this = this
    for (const key in _chart) {
      if (_chart.hasOwnProperty(key)) {
        _this[key] = _chart[key]
      }
    }
  }
  render() {
    let _this = this

    _svg = d3.select(this.el).append("svg")
      .attr("height", this.height)
      .attr("width", this.width);

    renderAxes(_svg);

    defineBodyClip(_svg);

    renderBody(_svg);
    
    function renderAxes(svg) {
      let axesG = svg.append("g")
        .attr("class", "axes");
  
      renderXAxis(axesG);
  
      renderYAxis(axesG);
    }
  
    function renderXAxis(axesG) {
      let xAxis = d3.svg.axis()
        .scale(_this.x.range([0, quadrantWidth()]))
        .orient("bottom");
  
      axesG.append("g")
        .attr("class", "x axis")
        .attr("transform", function () {
          return "translate(" + xStart() + "," + yStart() + ")";
        })
        .call(xAxis);
  
      d3.selectAll("g.x g.tick")
        .append("line")
        .classed("grid-line", true)
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", -quadrantHeight());
    }
  
    function renderYAxis(axesG) {
      let yAxis = d3.svg.axis()
        .scale(_y.range([quadrantHeight(), 0]))
        .orient("left");
  
      axesG.append("g")
        .attr("class", "y axis")
        .attr("transform", function () {
          return "translate(" + xStart() + "," + yEnd() + ")";
        })
        .call(yAxis);
  
      d3.selectAll("g.y g.tick")
        .append("line")
        .classed("grid-line", true)
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", quadrantWidth())
        .attr("y2", 0);
    }
  }
  lineChart() {


    function defineBodyClip(svg) {
      let padding = 5;

      svg.append("defs")
        .append("clipPath")
        .attr("id", "body-clip")
        .append("rect")
        .attr("x", 0 - padding)
        .attr("y", 0)
        .attr("width", quadrantWidth() + 2 * padding)
        .attr("height", quadrantHeight());
    }

    function renderBody(svg) {
      if (!_bodyG)
        _bodyG = svg.append("g")
        .attr("class", "body")
        .attr("transform", "translate(" +
          xStart() + "," +
          yEnd() + ")")
        .attr("clip-path", "url(#body-clip)");

      renderLines();

      renderDots();
    }

    function renderLines() {
      _line = d3.svg.line()
        .x(function (d) {
          return _x(d.x);
        })
        .y(function (d) {
          return _y(d.y);
        });

      _bodyG.selectAll("path.line")
        .data(_data)
        .enter()
        .append("path")
        .style("stroke", function (d, i) {
          return _colors(i);
        })
        .attr("class", "line");

      _bodyG.selectAll("path.line")
        .data(_data)
        .transition()
        .attr("d", function (d) {
          return _line(d);
        });
    }

    function renderDots() {
      _data.forEach(function (list, i) {
        _bodyG.selectAll("circle._" + i)
          .data(list)
          .enter()
          .append("circle")
          .attr("class", "dot _" + i);

        _bodyG.selectAll("circle._" + i)
          .data(list)
          .style("stroke", function (d) {
            return _colors(i);
          })
          .transition()
          .attr("cx", function (d) {
            return _x(d.x);
          })
          .attr("cy", function (d) {
            return _y(d.y);
          })
          .attr("r", 4.5);
      });
    }

    function xStart() {
      return _margins.left;
    }

    function yStart() {
      return _height - _margins.bottom;
    }

    function xEnd() {
      return _width - _margins.right;
    }

    function yEnd() {
      return _margins.top;
    }

    function quadrantWidth() {
      return _width - _margins.left - _margins.right;
    }

    function quadrantHeight() {
      return _height - _margins.top - _margins.bottom;
    }


    _chart.addSeries = function (series) {
      _data.push(series);
      return _chart;
    };

    return _chart;
  }
}


function randomData() {
  return Math.random() * 9;
}

function update() {
  for (let i = 0; i < data.length; ++i) {
    let series = data[i];
    series.length = 0;
    for (let j = 0; j < numberOfDataPoint; ++j)
      series.push({
        x: j,
        y: randomData()
      });
  }

  chart.render();
}

let numberOfSeries = 2,
  numberOfDataPoint = 11,
  data = [];

for (let i = 0; i < numberOfSeries; ++i)
  data.push(d3.range(numberOfDataPoint).map(function (i) {
    return {
      x: i,
      y: randomData()
    };
  }));

let chart = lineChart()
  .x(d3.scale.linear().domain([0, 10]))
  .y(d3.scale.linear().domain([0, 10]));

data.forEach(function (series) {
  chart.addSeries(series);
});

chart.render();