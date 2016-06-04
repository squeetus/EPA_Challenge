function matrixPlot() {

  var margin = {top: 40, right: 20, bottom: 20, left: 40},
      width = 760,
      height = 200,
      chartContainer,
      defaultData = [ [ 1, 0, 0, 0 ],
                      [ 1, 1, 1, 1 ],
                      [ 0, 0, 1, 0 ],
                      [ 0, 0, 1, 1 ]
                    ];

  /* Draw a chemical scrubber matrix based on the given config setup */
  function matrix(selection) {
    selection.each(function(data) {
      width = d3.select(this.parentNode).node().getBoundingClientRect().width - margin.left - margin.right - 30;

      var x,
        y,
        z = d3.scale.linear().domain( [0, d3.max(data, function(d) { return d3.max(d.data); })] ).range([0.0, 1]),//.clamp( true ),
        c = d3.scale.category10().domain( d3.range( 10 ) );

        x = d3.scale.ordinal().rangeBands( [ 0, width ] );
        x.domain( d3.range( data[0].data.length ));

        height = x.rangeBand() * data.length;

        y = d3.scale.ordinal().rangeBands( [ 0, height ] );
        y.domain( d3.range( data.length ) );

      // Append an svg element for the chart
      var svg = d3.select(this).append("svg");

      // Set up the <g> chart container and axes
      chartContainer = svg.append("g").attr("id", "chartContainer");

      // Update the outer dimensions.
      svg.attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom );

      // Update the inner dimensions.
      chartContainer.attr("transform", "translate(" + margin.left + "," + margin.top + ")");



      chartContainer.append("rect")
        .attr("class", "background")
        .attr("width", width )
        .attr("height", height );

      var row = chartContainer.selectAll(".row")
        .data(data)
      .enter().append("g")
        .attr("class", "row")
        .attr("transform", function(d, i) { return "translate(0," + y(i) + ")"; })
        // .attr("opacity", function(d, i) { return i < ? 1 : 0.2; })
        // .classed("rowHighlight", function(d, i) { return i < 2 ? true : false; })
        .each(rowe);

      row.append("line")
        .attr("x2", width);

      row.append("text")
        .attr("x", -4)
        .attr("y", y.rangeBand() / 2)
        .attr("font-size", "7px")
        .attr("dy", "5")
        .attr("text-anchor", "end")
        .text(function(d, i) { return data[i].cas; });

      var column = chartContainer.selectAll(".column")
           .data(data[0].data)
         .enter().append("g")
           .attr("class", "column")
           .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

       column.append("line")
           .attr("x1", -width - margin.left - margin.right);

       column.append("text")
           .attr("x", 2)
           .attr("y", x.rangeBand() / 2)
           .attr("dy", ".32em")
           .attr("font-size", "7px")
           .attr("text-anchor", "start")
           .text(function(d, i) { return (1987 + i); })
           .on('mouseover', function(d, i) {
              d3.select(d3.select(this).node().parentNode)
                    .style("opacity", 0);
           });
          //  .attr("transform", function(d, i) { return "rotate(90)"; });

      function rowe(row) {
        var cell = d3.select(this).selectAll(".cell")
            .data(row.data)
          .enter().append("rect")
            .attr("class", "cell")
            .attr("x", function(d,i) { return x(i); })
            .attr("width", x.rangeBand())
            .attr("height", y.rangeBand())
            .style("fill-opacity", function(d) { return z(d); })
            .style("fill", function(d) { return 'darkgreen'; });
            // .on("mouseover", function(d) { console.log(d); });
            // .on("mouseout", mouseout);
      }

      console.log(column);

    });
  }

  return matrix;
}
