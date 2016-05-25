var page = 1;

$(function(){

 document.onkeypress = function(e){
   if(e.keyCode === 13) {
     console.log('hit');
    }
 };
});

d3.select("#back").on("click", function() {
  console.log('click');
  if(page > 1)
    createFacilityList(100,  --page);
});

d3.select("#forward").on("click", function() {
  console.log('click');
  createFacilityList(100, ++page);
});

/*
    Asynchronous method queries for a particular page of facilities
      and passes the resultant JSON to the callback function for consumption
*/
var getFacilities = function(number, page, cb) {
  // GET facility data from API
  $.ajax({
      url: "/data/facilities?limit="+number+"&skip="+(number*(page-1)),
      type: "get"
  }).done(function(data) {
      cb(data);
  }).error(function(err){
      console.log(err);
  });
};


var createFacilityList = function(limit, page) {
  console.log(limit, page);
    d3.select(".panels").selectAll(".panel").remove();
  // get facilities from API, then render the list
  getFacilities(limit, page, function(data) {
    console.log(data);

    var facilityPanel = d3.select(".panels").selectAll(".panel")
            .data(data)
          .enter().append("div")
            .classed("panel panel-default", true);

    facilityPanel.append("div")
          .classed("panel-heading", true)
          .text(function(d) {
            console.log(d);
            return d.facility_name;
          });
    facilityPanel.append("div")
          .classed("panel-body", true)
          .text(function(d) {
            console.log(d);
            return JSON.stringify(d);
          });
  });
};

createFacilityList(100, 1);
