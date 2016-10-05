(function barChart() {
  var margin = {top: 5, right: 100, bottom: 50, left: 100},
      width = 760,
      height = 300,
      chartContainer,
      overlays = 0,
      xValue = function(d, i) { return i; },
      yValue = function(d, i) { return d; },
      xScale = d3.scale.linear(),
      yScale = d3.scale.linear(),
      bisect = d3.bisector(function(d) { return d[0]; }).left,
      x, y, xAxis, yAxis, svg;

  var tooltip = d3.select("body").append("div")
     .attr("class", "tooltip")
     .style("opacity", 0);

  function chart(selection) {

    selection.each(function(data) {
      width = d3.select(this.parentNode).node().getBoundingClientRect().width - margin.left - margin.right;
      height = height - margin.top - margin.bottom;

      // set up the domains for the axes
      x = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);
      y = d3.scale.linear().range([height, 0]);

      x.domain(data.map(function(d, i) { return i + 1987; }));
      y.domain([0, d3.max(data, function(d, i) { return d; })]);

      xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickValues(x.domain());


      yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10);

      // Append an svg element for the chart
      svg = d3.select(this).append("svg");

      // Set up the <g> chart container and axes
      chartContainer = svg.append("g").attr("class", "barChartContainer");
      chartContainer.append("g").attr("class", "x axis");
      chartContainer.append("g").attr("class", "y axis");

      // Update the outer dimensions.
      svg.attr("width", width + margin.left + margin.right)
      // svg.attr("width", width)
          .attr("height", height + margin.top + margin.bottom);

      // Update the inner dimensions.
      chartContainer.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Update the x-axis.
      chartContainer.select(".x.axis")
          .attr("transform", "translate(0," + (height) + ")")
          .call(xAxis)
        .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", "-.55em")
          .attr("transform", "rotate(-90)" );

      // Update the y-axis.
      chartContainer.select(".y.axis")
          .call(yAxis);

      // Draw the bars
      chartContainer.selectAll("bar")
          .data(data)
        .enter().append("rect")
          .classed("bar", true)
          .attr("year", function(d, i) {
            return i + 1987;
          })
          .style("fill", "steelblue")
          .attr("x", function(d, i) { return x(i + 1987); })
          .attr("width", x.rangeBand())
          .attr("y", function(d) { return y(d); })
          .attr("height", function(d) { return height - y(d); })
          .on("mouseover", function(d) {
            console.log(d); // data for selected year

            d3.selectAll(".bar").classed("fade", true);
            d3.select(this)
                  .classed("fade", false);
          })
          .on("mouseout", function(d) {
            d3.selectAll(".bar")
                  .classed("fade", false);
          });

      chartContainer.select(".x.axis").selectAll(".tick")[0].forEach(function(d1) {
        var year = d3.select(d1).data()[0] - 1987; //get the data asociated with x axis

        d3.select(d1).on("mouseover", function(d) {
          console.log(data[year]); // data for selected year

          d3.selectAll(".bar").classed("fade", true);
          d3.selectAll(".bar").filter(function(d, i) { return i === year ? true : false;})
                .classed("fade", false);
                //on mouse hover show the tooltip
                // tooltip.transition()
                //     .duration(200)
                //     .style("opacity", 0.5);
                // tooltip.html(data)
                //     .style("left", (d3.event.pageX) + "px")
                //     .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
          d3.selectAll(".bar")
                .classed("fade", false);
          //on mouse out hide the tooltip
            // tooltip.transition()
            //     .duration(500)
            //     .style("opacity", 0);
        });

      });
    });
  }

  window.barChart = chart;
})();
