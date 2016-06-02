function timeSeriesChart() {
  var margin = {top: 20, right: 20, bottom: 20, left: 120},
      width = 760,
      height = 120,
      xValue = function(d) { return d[0]; },
      yValue = function(d) { return d[1]; },
      xScale = d3.scale.linear(),
      yScale = d3.scale.linear(),
      xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(6, 0).tickFormat(d3.format("d")),
      yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(4, "s").tickSize(6, 0),
      area = d3.svg.area().x(X).y1(Y),
      line = d3.svg.line().x(X).y(Y);

  function chart(selection) {
    selection.each(function(data) {

      // Convert data to standard representation greedily;
      // this is needed for nondeterministic accessors.
      data = data.map(function(d, i) {
        return [xValue.call(data, d, i), yValue.call(data, d, i)];
      });

      // Update the x-scale.
      xScale
          .domain(d3.extent(data, function(d) { return d[0]; }))
          .range([0, width - margin.left - margin.right]);

      // Update the y-scale.
      yScale
          .domain([0, d3.max(data, function(d) { return d[1]; })])
          .range([height - margin.top - margin.bottom, 0]);

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);

      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter().append("svg").append("g").attr("id", "chartContainer");

      gEnter.append("g").attr("class", "x axis");
      gEnter.append("g").attr("class", "y axis");
      gEnter.append("g").attr("id", "overlay1");
      gEnter.select("#overlay1").append("path").attr("class", "area");
      gEnter.select("#overlay1").append("path").attr("class", "line");

      // Update the outer dimensions.
      svg .attr("width", width)
          .attr("height", height);

      // Update the inner dimensions.
      var g = svg.select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
          // .attr("id", g1);

      // Update the area path.
      g.select(".area")
          .attr("d", area.y0(yScale.range()[0]))
          .on("mouseover", function (d) {
            console.log('boop');
          });

      // Update the line path.
      g.select(".line")
          .attr("d", line);

      // Update the x-axis.
      g.select(".x.axis")
          .attr("transform", "translate(0," + yScale.range()[0] + ")")
          .call(xAxis);

      // Update the y-axis.
      g.select(".y.axis")
          .attr("transform", "translate(0," + xScale.range()[0] + ")")
          .call(yAxis);
    });
  }

  chart.addLayer = function(selection) {
    selection.each(function(data) {

      // Convert data to standard representation greedily;
      // this is needed for nondeterministic accessors.
      data = data.map(function(d, i) {
        return [xValue.call(data, d, i), yValue.call(data, d, i)];
      });

      // Update the y-scale.
      if(d3.max(data, function(d) { return d[1]; }) > yScale.domain()[1]) {
        yScale
          .domain([0, d3.max(data, function(d) { return d[1]; })]);
      }

      // // // Select the svg element, if it exists.
      // var svg = d3.select(this).selectAll("svg");
      // //
      // var gEnter = svg.select("g").data([data]).enter()
      //       .append("g").attr("id", "overlay2");
      // Select the svg element, if it exists.

      var svg = d3.select(this).select("svg").select("#chartContainer");
      // Otherwise, create the skeletal chart.
      var gEnter = svg.data([data]).enter();


      gEnter.append("g").attr("id", "overlay2");
      gEnter.append("path").attr("class", "area");
      gEnter.append("path").attr("class", "line");

      // Update the inner dimensions.
      var g = svg.select("overlay2")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Update the area path.
      g.select(".area")
          .attr("d", area.y0(yScale.range()[0]))
          // .classed(".areaOverlay", true)
          .on("mouseover", function (d) {
            console.log('peep');
          });

      // Update the line path.
      g.select(".line")
          .attr("d", line);

    });
  };

  // The x-accessor for the path generator; xScale ∘ xValue.
  function X(d) {
    return xScale(d[0]);
  }

  // The x-accessor for the path generator; yScale ∘ yValue.
  function Y(d) {
    return yScale(d[1]);
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  return chart;
}
