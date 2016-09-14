/*
    Asynchronous method queries for facility usage data
      and passes the resultant JSON to the callback function for consumption
*/
var getData = function(naics, cb) {
  // GET facility data from API
  $.ajax({
      url: "/data/industries/naics/" + naics + "/usage/total?limit=" + params.limit + "&from=" + params.from + "&to=" + params.to,
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

/*
    Asynchronous method queries for method usage data
      and passes the resultant JSON to the callback function for consumption
*/
var getMethodCount = function(cas, cb) {
  // GET facility data from API
  $.ajax({
      url: "/data/methods/cas/" + cas + "/count?naics=2211",
      type: "get"
  }).done(function(data) {
    if(typeof data != 'object') {
      console.log("error!", cas);
      return;
    }
    cb(null, {"cas": cas, "data": data});
  }).error(function(err){
      console.log(err);
  });
};

// Sets the description content for the chart(s)
var setDescription = function( desc ) {
    d3.select("#description")
          .text(desc);
};



/**********************************************************************

          F A C I L I T Y   U S A G E   C H A R T S

***********************************************************************/

// Create a timeseries chart object.
// This will need to be refactored into a chart package at some point
var chart = timeSeriesChart()
    .x(function(d, i) { return i + params.from; }) // set the x range based on the time range
    .y(function(d) { return +d; });
    //.ticksX((params.to-params.from)/2); // set the number of ticks based on the time range

chart.height(100);
// get facility data for a particular industry sector
getData(params.naics, function( data ) {
  // setDescription("Top " + data.length + " facilities by total usage (from industry " + params.naics + ")");
  data.forEach(function(d, i) {
    d3.select("#visA")
    .append("div")
    .attr("class", "chartTitle")
    .html( "Facility Name:" + d.facility_name + "<br />" 
            // "Location:&emsp;&emsp;&emsp;" + d.loc + "<br />" +
            // "TRI Facility ID:&emsp;" + d.tri_facility_id
        )
    .append("div")
    .attr("id", "chart" + i)
    .attr("class", "chart")
    .datum(data[i].yearly)
    .call(chart);

  });
});

/**********************************************************************

          T O P   K   C H A R T

***********************************************************************/

var chartB = timeSeriesChart()
    .x(function(d, i) { return i + params.from; }) // set the x range based on the time range
    .y(function(d) { return +d; });

params.limit = 1000;
getData(params.naics, function( data ) {
  // setDescription("Top " + data.length + " facilities (by total usage) (from industry " + params.naics + ")");
  var aggregate = [];
  var total = [];
  var i, j, k;

  // intialize arrays
  for( j = 0; j < 5; j++ )
    aggregate[j] = [];
  for( i = 0; i < data[0].yearly.length; i++ ) {
    for( j = 0; j < 5; j++ )
      aggregate[j][i] = 0;
    total[i] = 0;
  }

  // for each facility
  for( i = 0; i < data.length; i++ ) {
    // sum up each year
    for( j = 0; j < data[0].yearly.length; j++) {
        total[j] += data[i].yearly[j];

        // add yearly usage for top K
        if( i < 10 ) {
          for( k = 0; k < 4; k++)
            aggregate[k][j] += data[i].yearly[j];
        } else if( i < 50 ) {
          for( k = 1; k < 4; k++)
            aggregate[k][j] += data[i].yearly[j];
        } else if( i < 100 ) {
          for( k = 2; k < 4; k++)
            aggregate[k][j] += data[i].yearly[j];
        } else if( i < 150 ) {
          for( k = 3; k < 4; k++)
            aggregate[k][j] += data[i].yearly[j];
        }
    }
  }

  chartB.height(200);

  d3.select("#visB")
    .append("div")
    .attr("class", "chartTitle")
    .text("Top " + data.length + " vs top 10, 50, 100, and 150")
    .append("div")
    .attr("id", "chartTopK")
    .attr("class", "chart")
    .datum(total)
    .call(chartB);

  for( i = 3; i >= 0; i-- ) {
    d3.select("#visB")
      .datum(aggregate[i])
      .call(chartB.addLayer);
  }
});

/**********************************************************************

          M A P   C H A R T

***********************************************************************/
var map = USAchart();
map.bubbleRange([3, 10]);

params.limit = 100;

getData(params.naics, function( data ) {
  d3.select("#visC")
    .append("div")
    .attr("class", "chartTitle")
    // .text("USA Map")
    .append("div")
    .attr("id", "map1")
    .attr("class", "map")
    .datum(data)
    .call(map);
});

/**********************************************************************

          T R E A T M E N T   M A T R I X

***********************************************************************/

var matrix = matrixPlot();
var q = d3_queue.queue(); //1 for sequential queries
var cas = [7647010, "7664939", "7664393", "N420", "N458", "N040", "N450", "N982", "N090",
            "N100", "N495", "N770", "N150", "N020", "N096", "N590", "7664417", "N725", "191242",
            "N050", "N760", "91203", "N010"];

for( var i = 0; i < cas.length; i++ ) {
  q.defer(getMethodCount, cas[i]);
}

q.awaitAll(function(error, data) {
    if (error) throw error;

    d3.select("#visD")
      .append("div")
      .attr("class", "chartTitle")
      .text("Air Treatment Methods for Electric Utilities' most-used chemicals ")
      .append("div")
      .attr("id", "matrix1")
      .attr("class", "matrix")
      .datum(data)
      .call(matrix);

});
