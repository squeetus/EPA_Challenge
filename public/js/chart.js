console.log(":)");

/*
    Asynchronous method queries for facility usage data
      and passes the resultant JSON to the callback function for consumption
*/
var getData = function(naics, cb) {
  // GET facility data from API
  $.ajax({
      url: "/data/industries/naics/" + naics + "/usage/total",
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

var chart = timeSeriesChart()
    .x(function(d, i) { return i + 1987; })
    .y(function(d) { return +d; });


var setDescription = function( desc ) {
    d3.select("#description")
          .text(desc);
};

switch(version) {
  case 1:

    getData('221112', function( data ) {
      setDescription("Top " + data.length + " facilities by total usage (from industry " + 221112 + ")");
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
    setDescription("Top 10 facilities (by total usage) (from industry " + 221112 + ")");
    getData('221112', function( data ) {
      var aggregate = [];
      var total = [];
      var i, j, k;

      for( i = 0; i < 27; i++ ) {
         aggregate[i] = 0;
         total[i] = 0;
       }

      for( j = 0; j < 10; j++ ) {
        for( k = 0; k < data[j].yearly.length; k++ ) {
          aggregate[k] += data[j].yearly[k];
          total[k] += data[j].yearly[k];
        }
      }
      for( j = 10; j < 100; j++ ) {
        for( k = 0; k < data[j].yearly.length; k++ ) {
          total[k] += data[j].yearly[k];
        }
      }
      console.log(aggregate, total);

      d3.select("#vis")
        .append("div")
        .attr("class", "chartTitle")
        .text("Top 10")
        .append("div")
        .attr("id", "chart1")
        .attr("class", "chart")
        .datum(aggregate)
        .call(chart);

      d3.select("#vis")
        .append("div")
        .attr("class", "chartTitle")
        .text("Top " + 100)
        .append("div")
        .attr("id", "chart2")
        .attr("class", "chart")
        .datum(total)
        .call(chart);
    });
    break;
}
