String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

// accept keypress events
$(function(){
 document.onkeypress = function(e){
   if(e.keyCode === 13) {
     console.log('hit');
    }
 };
});

// bind pagination functionality to the 'back' button
d3.select("#back").on("click", function() {
  console.log('click');
  if(page > 1)
    createChemicalList(limit,  --page);
});

// bind pagination functionality to the 'forward' button
d3.select("#forward").on("click", function() {
  console.log('click');
  createChemicalList(limit, ++page);
});


/*
    Asynchronous method queries for a particular page of facilities
      and passes the resultant JSON to the callback function for consumption
*/
var getChemicals = function(number, page, cb) {
  // GET chemical data from API
  $.ajax({
      url: "/data/chemicals?limit="+number+"&skip="+(number*(page-1)),
      type: "get"
  }).done(function(data) {
      cb(data);
  }).error(function(err){
      console.log(err);
  });
};

/*
    Create a list of <limit> chemical panels
*/
var createChemicalList = function(limit, page) {

  // clear previous panels from panels region
  d3.select(".panels").selectAll(".panel").remove();

  // show which chemicals are shown
  d3.select("#page").text((((page-1) * limit)+1) + " - " + (page * limit));

  // get chemicals from API, then render the list
  getChemicals(limit, page, function(data) {

    // if asynchronous API call returned error, don't continue
    if(typeof data != 'object') {
      console.log("error!");
      return;
    }

    // return an array containing the sum of each index of all arrays passed
    var addArrays = function(args) {
      var arr = [];
      for(var i = 0; i < args[0].length; i++ )
        arr[i] = 0;

      for(var a in args) {
        for(var j in args[a]) {
          arr[j] += +args[a][j];
        }
      }
      return arr;
    };

    // get the chemical panel, bind JSON chemical data to it
    var chemicalPanel = d3.select(".panels").selectAll(".panel")
            .data(data)
          .enter().append("div")
            .classed("panel panel-default", true);

    // append panel headings with chemical name
    chemicalPanel.append("div")
          .classed("panel-heading chemical_name", true)
          .text(function(d) {
            return d.chemical.toProperCase() + " --- " + d.cas;
          });

    // append panel bodies with chemical details
    chemicalPanel.append("div")
          .classed("panel-body", true)
          .html(function(d) {
            var chemString = JSON.stringify(d);

            // facString += "Facility ID: <span class='tri_facility_id'>"+d.tri_facility_id+"</span><br />";
            // facString += "Address: <span class='address'>"+d.street_address + ", " + d.city + ", " + d.county + ", " + d.state + ", " + d.zip + ", [" + d.loc + "]</span><br />";
            // facString += (d.bia_code || d.tribe) ? "Tribe: <span class='tribe'>"+d.bia_code + " " + d.tribe+"</span><br />" : "";
            // facString += "Federal Facility: <span class='federal_facility'>"+d.federal_facility+"</span><br />";
            // facString += "Industry: NAICS <span class='naics'>"+d.primary_naics + "</span>, SIC <span class='sic'>" + d.primary_sic+"</span><br /><br />";
            // for(var c in d.chemicals) {
            //   facString += "<span class='chemical'>" + d.chemicals[c].chemical + "  ---  " + c + "</span><br />";
            //   facString += "<span class='airReleases chemicalData'>Air: " + d.chemicals[c].air + "</span><br />";
            //   facString += "<span class='landReleases chemicalData'>Land: " + d.chemicals[c].land + "</span><br />";
            //   facString += "<span class='waterReleases chemicalData'>Water: " + d.chemicals[c].air + "</span><br />";
            //   facString += "<span class='recycling chemicalData'>Recycling: " + d.chemicals[c].land + "</span><br />";
            //   facString += "<span class='recovery chemicalData'>Recovery: " + d.chemicals[c].air + "</span><br />";
            //   facString += "<span class='treatment chemicalData'>Treatment: " + d.chemicals[c].land + "</span><br />";
            //   facString += "<span class='offsite chemicalData'>off-site: " + addArrays([d.chemicals[c].offsite_disposal,d.chemicals[c].offsite_recycling,d.chemicals[c].offsite_recovery,d.chemicals[c].offsite_treatment,d.chemicals[c].offsite_potws]) + "</span><br /><br />";
            // }

            return chemString;
          });
  });
};

// initialize
createChemicalList(limit, page);
