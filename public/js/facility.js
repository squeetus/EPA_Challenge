String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

// show the facility location on a map
d3.select("#mapElement")
  .append("div")
    .attr("id", "location")
    .attr("class", "map")
    .datum(facility)
    .call(USAchart().bubbleRange([0,5]));
