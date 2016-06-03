function timeSeriesChart() {

  var margin = {top: 20, right: 20, bottom: 20, left: 50},
      width = 760,
      height = 200,
      chartContainer,
      xValue = function(d) { return d[0]; },
      yValue = function(d) { return d[1]; },
      xScale = d3.scale.linear(),
      yScale = d3.scale.linear(),
      bisect = d3.bisector(function(d) { return d[0]; }).left,
      xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(5).tickSize(6, 0).tickFormat(d3.format("d")),
      yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(4).tickSize(6, 0).tickFormat(formatAbbreviation),
      area = d3.svg.area().x(X).y1(Y),
      line = d3.svg.line().x(X).y(Y);

  function chart(selection) {
    selection.each(function(data) {
      width = d3.select(this.parentNode).node().getBoundingClientRect().width - margin.left;

      // Convert data to standard representation greedily;
      // this is needed for nondeterministic accessors.
      data = data.map(function(d, i) {
        return [xValue.call(data, d, i), yValue.call(data, d, i)];
      });

      // Update the x-scale
      xScale
          .domain(d3.extent(data, function(d) { return d[0]; }))
          .range([0, width - margin.left - margin.right]);

      // Update the y-scale
      yScale
          .domain([0, d3.max(data, function(d) { return d[1]; })])
          .range([height - margin.top - margin.bottom, 0]);

      // Set the number of ticks appropriately
      xAxis.ticks((function() {
        if(width <= 200) return 0;
        if(width <= 500) return 5;
        return ( data.length / 2 );
      })());

      // Append an svg element for the chart
      var svg = d3.select(this).append("svg");

      // Set up the <g> chart container and axes
      chartContainer = svg.append("g").attr("id", "chartContainer");
      chartContainer.append("g").attr("class", "x axis");
      chartContainer.append("g").attr("class", "y axis");

      // Update the outer dimensions.
      svg .attr("width", width + margin.left + margin.right)
          .attr("height", height);

      // Update the inner dimensions.
      chartContainer.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Update the x-axis.
      chartContainer.select(".x.axis")
          .attr("transform", "translate(0," + yScale.range()[0] + ")")
          .call(xAxis);

      // Update the y-axis.
      chartContainer.select(".y.axis")
          .attr("transform", "translate(0," + xScale.range()[0] + ")")
          .call(yAxis);

      //
      var g = d3.select(this).select("#chartContainer").selectAll(".overlay").data([data]).enter().append("g");//.attr("class", "chart");
      g.append("path").attr("class", "area");
      g.append("path").attr("class", "line");

      // Update the area path.
      g.select(".area")
          .attr("d", area.y0(yScale.range()[0]));
          // .on("mouseover", function (d) {
          //   d3.select(this).classed("hover", true);
          // })
          // .on("mouseout", function (d) {
          //   d3.select(this).classed("hover", false);
          // });

      // Update the line path.
      g.select(".line")
          .attr("d", line);

      var focus = svg.append("g")
          .attr("class", "focus")
          .style("display", "none");

      focus.append("circle")
          .attr("r", 4.5);

      focus.append("text")
          .attr("x", 10)
          .attr("dy", ".35em");

      chartContainer.append("rect")
          .attr("class", "focusOverlay")
          .attr("width", width)
          .attr("height", height)
          .on("mouseover", function() { focus.style("display", null); })
          .on("mouseout", function() { focus.style("display", "none"); })
          .on("mousemove", mousemove);




      function mousemove() {
        yScale
            .domain([0, d3.max(data, function(d) { return d[1]; })]);

        var x0 = xScale.invert(d3.mouse(this)[0]),
            // y = d3.select(this).node().parentNode.yScale,
            i = bisect(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i] || [Infinity];
            d = x0 - d0[0] > d1[0] - x0 ? d1 : d0;

        focus.attr("transform", "translate(" + (xScale(d[0]) + margin.left) + "," + (yScale(d[1]) + margin.bottom) + ")");
        focus.select("text").text(d3.format(",.0f")(d[1]) + " lbs");
      }


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

      var g = d3.select(this).select("#chartContainer").selectAll(".overlay").data([data]).enter().append("g").attr("class", "chart");
      g.append("path").attr("class", "area");
      g.append("path").attr("class", "line");

      // Update the area path.
      g.select(".area")
          .attr("d", area.y0(yScale.range()[0]))
          .on("mouseover", function (d) {
            d3.select(this).classed("hover", true);
          })
          .on("mouseout", function (d) {
            d3.select(this).classed("hover", false);
          });

      // Update the line path.
      g.select(".line")
          .attr("d", line);
      // var focus = d3.select(this).select("#chartContainer").append("g")
      //     .attr("class", "focus")
      //     .style("display", "none");
      //
      // focus.append("circle")
      //     .attr("r", 4.5);
      //
      // focus.append("text")
      //     .attr("x", 10)
      //     .attr("dy", ".35em");
      //
      // chartContainer.append("rect")
      //     .attr("class", "focusOverlay")
      //     .attr("width", width)
      //     .attr("height", height)
      //     .on("mouseover", function() { focus.style("display", null); })
      //     .on("mouseout", function() { focus.style("display", "none"); })
      //     .on("mousemove", mousemove);
      //
      // console.log(yScale.domain());
      //
      //
      // function mousemove() {
      //   yScale
      //       .domain([0, d3.max(data, function(d) { return d[1]; })]);
      //   var x0 = xScale.invert(d3.mouse(this)[0]),
      //       i = bisect(data, x0, 1),
      //       d0 = data[i - 1],
      //       d1 = data[i] || [Infinity];
      //       d = x0 - d0[0] > d1[0] - x0 ? d1 : d0;
      //
      //   focus.attr("transform", "translate(" + (xScale(d[0]) + margin.left) + "," + (yScale(d[1]) + margin.bottom) + ")");
      //
      //   focus.select("text").text(d[1]);
      // }

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

  chart.ticksX = function(_) {
    if (!arguments.length) return xAxis.ticks()[0];
    xAxis.ticks(_);
    return chart;
  };

  return chart;
}
