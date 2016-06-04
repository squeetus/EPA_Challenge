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
      width = d3.select(this.parentNode).node().getBoundingClientRect().width - margin.left - margin.right;
      height = width;

      data = defaultData;
      // caution!!
      // var maxScrub = d3.max(data[0].scrubbers);
      var maxScrub = 1;

      var x = d3.scale.ordinal().rangeBands( [ 0, width ] ),
        y = d3.scale.ordinal().rangeBands( [ 0, height ] ),
        z = d3.scale.linear().domain( [ 0, maxScrub ] ).range([0.1, 1]).clamp( true ),
        c = d3.scale.category10().domain( d3.range( 10 ) );

      // Append an svg element for the chart
      var svg = d3.select(this).append("svg");

      // Set up the <g> chart container and axes
      chartContainer = svg.append("g").attr("id", "chartContainer");

      // Update the outer dimensions.
      svg.attr("width", width + margin.left + margin.right)
          .attr("height", height);

      // Update the inner dimensions.
      chartContainer.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      x.domain( d3.range( data[0].length ) );
      y.domain( d3.range( data.length ) );


      chartContainer.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height);

      var row = chartContainer.selectAll(".row")
        .data(data)
      .enter().append("g")
        .attr("class", "row")
        .attr("transform", function(d, i) { return "translate(0," + y(i) + ")"; })
        // .attr("opacity", function(d, i) { return i < ? 1 : 0.2; })
        .classed("rowHighlight", function(d, i) { return i < 2 ? true : false; })
        .each(rowe);

      row.append("line")
        .attr("x2", width);

      row.append("text")
        .attr("x", -4)
        .attr("y", x.rangeBand() / 2)
        .attr("font-size", "7px")
        .attr("dy", "0")
        .attr("text-anchor", "end")
        .text(function(d, i) { return data[i]; });

      var column = chartContainer.selectAll(".column")
           .data(data)
         .enter().append("g")
           .attr("class", "column")
           .attr("transform", function(d, i) { return "translate(" + y(i) + ")rotate(-90)"; });

       column.append("line")
           .attr("x1", -width);

       column.append("text")
           .attr("x", 2)
           .attr("y", y.rangeBand() / 2)
           .attr("dy", ".32em")
           .attr("font-size", "7px")
           .attr("text-anchor", "start")
           .text(function(d, i) { return (1986 + i); });
          //  .attr("transform", function(d, i) { return "rotate(90)"; });

      function rowe(row) {
        var cell = d3.select(this).selectAll(".cell")
            .data(row)
          .enter().append("rect")
            .attr("class", "cell")
            .attr("x", function(d,i) { return x(i); })
            .attr("width", x.rangeBand())
            .attr("height", y.rangeBand())
            .style("fill-opacity", function(d) { return z(d); })
            .style("fill", function(d) { return 'darkgreen'; })
            .on("mouseover", function() { console.log("mouseover"); });
            // .on("mouseout", mouseout);
      }

    });
  }

  return matrix;
}
