function timeSeriesChart() {

  var margin = {top: 20, right: 100, bottom: 20, left: 50},
      width = 760,
      height = 200,
      chartContainer,
      overlays = 0,
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
      svg.attr("width", width + margin.left + margin.right)
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

      // Bind the data to the relevant element
      var g = d3.select(this).select("#chartContainer").selectAll(".overlay").data([data]).enter().append("g");
      g.append("path").attr("class", "area");
      g.append("path").attr("class", "line");

      // Update the area path.
      g.select(".area")
          .attr("d", area.y0(yScale.range()[0]));

      // Update the line path.
      g.select(".line")
          .attr("d", line);

      // Set up the elements for the tooltip
      var focus = svg.append("g")
          .attr("class", "focus")
          .style("display", "none");
      focus.append("circle")
          .attr('id', 'focusCircle')
          .attr("r", 4.5);
      focus.append('line')
          .attr('id', 'focusLineX')
          .attr('class', 'focusLine');
      focus.append('line')
          .attr('id', 'focusLineY')
          .attr('class', 'focusLine');
      focus.append("text")
          .attr('class', "focusText")
          .attr('id', "focusText")
          .attr("x", 10)
          .attr("dy", ".35em");
      chartContainer.append("rect")
          .attr("class", "focusOverlay")
          .attr("width", width)
          .attr("height", height)
          .on("mouseover", function() { focus.style("display", null); })
          .on("mouseout", function() { focus.style("display", "none"); })
          .on("mousemove", mousemove);

      // Handle tooltip overlay
      function mousemove() {
        // (re)set the scale domain
        yScale
            .domain([0, d3.max(data, function(d) { return d[1]; })]);

        // set relevant positions for the given mouse movement
        var x0 = xScale.invert(d3.mouse(this)[0]),
            i = bisect(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i] || [Infinity];
            d = x0 - d0[0] > d1[0] - x0 ? d1 : d0;

        i = x0 - d0[0] > d1[0] - x0 ? i : i - 1;
        var ys = [];

        // collect all data from overlays
        for( var j = 0; j < d3.select("#chartContainer").selectAll(".areaOverlay").selectAll("g").length; j++ ) {
          ys[j + 1] = d3.select("#overlay" + j).data()[0][i][1];
        }

        var x = xScale(d[0]) + margin.left,
            y = yScale(d[1]) + margin.bottom,
            yDomain = d3.extent(data, function(d) { return d[1]; });
            xDomain = d3.extent(data, function(d) { return d[0]; });
        ys[0] = d[1];

        focus.selectAll('#focusCircle')
            .attr('cx', x)
            .attr('cy', function(d, i) {
                if(ys.length) return yScale((ys[i])) + margin.bottom;
                return y;
            });
        focus.select('#focusLineX')
            .attr('x1', x).attr('y1', yScale(yDomain[0]) + margin.bottom)
            .attr('x2', x).attr('y2', yScale(yDomain[1]));
        // focus.select('#focusLineY')
        //     .attr('x1', xScale(xDomain[0]) + margin.left).attr('y1', y)
        //     .attr('x2', xScale(xDomain[1]) + margin.right + margin.left).attr('y2', y);
        focus.selectAll('.focusText')
            .attr('x', x + 10)
            .attr('y', function(d, i) {
                if(ys.length) return yScale((ys[i])) + margin.bottom - 10;
                return y - 10;
            })
            .text(function(d, i) {
              return d3.format(",.0f")(ys[i]) + " lbs";
            });
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

      // Add an overlay element
      var g = d3.select(this).select("#chartContainer").selectAll(".overlay").data([data])
                .enter().append("g")
                  .attr("class", "areaOverlay")
                  .attr("id", "overlay" + overlays);
      g.append("path").attr("class", "area");
      g.append("path").attr("class", "line");

      // Update the area path.
      g.select(".area")
          .attr("d", area.y0(yScale.range()[0]));

      // Update the line path.
      g.select(".line")
          .attr("d", line);

      // Add new tooltip elements
      var focus = d3.select(".focus");
      focus.append("circle")
          .attr('id', 'focusCircle')
          .attr("r", 4.5);
      focus.append('line')
          .attr('id', 'focusLineX')
          .attr('class', 'focusLine');
      focus.append('line')
          .attr('id', 'focusLineY')
          .attr('class', 'focusLine');
      focus.append("text")
          .attr('class', 'focusText')
          .attr('id', "focusText" + overlays)
          .attr("x", 10)
          .attr("dy", ".35em");

      // increment the overlay count
      overlays++;
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
