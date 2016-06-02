
/*
    Asynchronous method queries for facility usage data
      and passes the resultant JSON to the callback function for consumption
*/
var getData = function(naics, cb) {
  // GET facility data from API
  $.ajax({
      url: "/data/industries/naics/" + naics + "/usage/total?from=" + params.from + "&to=" + params.to,
      type: "get"
  }).done(function(data) {
    if(typeof data != 'object') {
      console.log("error!");
      return;
    }
    cb(data);
  }).error(function(err){
      console.log(err);
  });
};

// Create a timeseries chart object.
// This will need to be refactored into a chart package at some point
var chart = timeSeriesChart()
    .x(function(d, i) { return i + params.from; }) // set the x range based on the time range
    .y(function(d) { return +d; });
    // .ticksX((params.to-params.from)/2); // set the number of ticks based on the time range

// Sets the description content for the chart(s)
var setDescription = function( desc ) {
    d3.select("#description")
          .text(desc);
};

// (Temporary) generate the relevant visualization based on the version argument
switch(version) {
  case 1:

    // get facility data for a particular industry sector
    getData(params.naics, function( data ) {
      setDescription("Top " + data.length + " facilities by total usage (from industry " + params.naics + ")");
      data.forEach(function(d, i) {
        d3.select("#vis")
        .append("div")
        .attr("class", "chartTitle")
        .html( "Facility Name: &emsp;" + d.facility_name + "<br />" +
                "Location:&emsp;&emsp;&emsp;" + d.loc
            )
        .append("div")
        .attr("id", "chart" + i)
        .attr("class", "chart")
        .datum(data[i].yearly)
        .call(chart);

      });
    });
    break;
  case 2:
    setDescription("Top 10 facilities (by total usage) (from industry " + params.naics + ")");
    getData(params.naics, function( data ) {
      var aggregate = [];
      var total = [];
      var i, j, k;

      for( i = 0; i < data[0].yearly.length; i++ ) {
         aggregate[i] = 0;
         total[i] = 0;
       }

      for( j = 0; j < 10; j++ ) {
        for( k = 0; k < data[j].yearly.length; k++ ) {
          aggregate[k] += data[j].yearly[k];
          total[k] += data[j].yearly[k];
        }
      }
      for( j = 10; j < data.length; j++ ) {
        for( k = 0; k < data[j].yearly.length; k++ ) {
          total[k] += data[j].yearly[k];
        }
      }

      d3.select("#vis")
        .append("div")
        .attr("class", "chartTitle")
        .text("Top 100 vs top 10")
        .append("div")
        .attr("id", "chart1")
        .attr("class", "chart")
        .datum(total)
        .call(chart);

      d3.select("#chart1")
        .datum(aggregate)
        .call(chart.addLayer);
    });
    break;
}
