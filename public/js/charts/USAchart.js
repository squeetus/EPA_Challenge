function USAchart() {
  var margin = {top: 20, right: 100, bottom: 20, left: 50},
      width = 760,
      height = width*0.5,
      mapContainer,
      formatNumber = d3.format(",.0f"),
      path = d3.geo.path()
        .projection(null),
      radius = d3.scale.sqrt()
        .range([2, 15]);

    function chart(selection) {
      selection.each(function(data) {
        // set the width
        width = d3.select(this.parentNode).node().getBoundingClientRect().width - margin.left - margin.right;
        height = width;

        projection = d3.geo.albersUsa()
            .scale(width * 1.5)
            .translate([width/2, height/2]);

        var path = d3.geo.path()
            .projection(projection);

        // Append an svg element for the chart
        var tooltip = d3.select(this).append("div")
                  .attr("id", "mapTooltip");
        var svg = d3.select(this).append("svg");


        // Set up the <g> map container
        mapContainer = svg.append("g").attr("id", "mapContainer");

        // Update the outer dimensions.
        svg.attr("width", width + margin.left + margin.right)
            .attr("height", height);

        // Update the inner dimensions.
        mapContainer.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        d3.json("/data/us.json", function(error, us) {
          if (error) throw error;
          mapContainer.insert("path", ".graticule")
              .datum(topojson.feature(us, us.objects.land))
              .attr("class", "land")
              .attr("d", path);

          radius.domain(d3.extent(data, function(d) { return d.total; }));

          // county borders
          // svg.insert("path", ".graticule")
          //     .datum(topojson.mesh(us, us.objects.counties, function(a, b) { return a !== b && !(a.id / 1000 ^ b.id / 1000); }))
          //     .attr("class", "border")
          //     .attr("d", path);

          // state borders
          mapContainer.insert("path", ".graticule")
              .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
              .attr("class", "border")
              .attr("d", path);

          // bubble chart for facility locations
          mapContainer.append("g")
              .attr("class", "bubble")
              .selectAll("circle")
              .data(data)
                .sort(function(a, b) { return b.total - a.total; })
            .enter().append("circle")
              .attr("id", function(d) { return "bubble_" + d.tri_facility_id; } )
              .attr("class", "bubbleCircle")
              .attr("transform", function(d) { return d.loc !== null ?  "translate(" + projection(d.loc) + ")" : [0,0]; })
              .attr("r", function(d) { return radius(d.total); })
              .on('mouseover', function(d) {
                  tooltip.html(
                    d.facility_name +
                    "<br /> Total:&nbsp" +
                    d3.format(",.2f")(d.total) +
                    " lbs"
                  );
              })
              .on('mouseout', function() {
                  tooltip.html("");
              });

            d3.select(self.frameElement).style("height", height + "px");
        });
      });
    }

    // get/set the range of the bubbles. Accepts array argument.
    chart.bubbleRange = function(_) {
      if (!arguments.length) return radius.range();
      radius.range(_);
      return chart;
    };


    return chart;
    //
    // d3.select(self.frameElement).style("height", height + "px");
}
