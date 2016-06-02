console.log(":)");

/*
    Asynchronous method queries for facility usage data
      and passes the resultant JSON to the callback function for consumption
*/
var getData = function(naics, cb) {
  // GET facility data from API
  $.ajax({
      url: "data/industries/naics/" + naics + "/usage/total",
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


getData('221112', function( data ) {
  data.forEach(function(d, i) {
    d3.select("#vis")
      .append("div")
      .attr("id", "chart" + i)
      .datum(data[i].yearly)
      .call(chart)
      .append("span")
      .text(d.facility_name);
  });
});
