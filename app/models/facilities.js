/**
 * This defines the Facilities class
 */

var mongoose = require('mongoose'),
    Chemical = mongoose.model('Chemical'),
    Schema = mongoose.Schema;

var Facility = new Schema ({
    tri_facility_id:    {type: String, default: ''},
    parent_company:     {type: String, default: ''},
    facility_name:      {type: String, default: ''},
    street_address:     {type: String, default: ''},
    city:               {type: String, default: ''},
    county:             {type: String, default: ''},
    state:              {type: String, default: ''},
    zip:                {type: Number, default: 0},
    bia_code:           {type: String, default: ''},
    tribe:              {type: String, default: ''},
    loc:                {type: [Number], index: '2dsphere', default: [null, null]},
    federal_facility:   {type: String, default: ''},
    primary_sic:        {type: Number, default: 0},
    primary_naics:      {type: String, default: ''},
    total_usage:        {type: [Number], default: 0},
    chemicals:          []
    /*
      - each element in the chemicals array will have the following attributes:
      cas: ''
      air: []
      water: []
      land: []
      recycling: []
      recovery: []
      treatment: []
      off-site_disposal: []
      off-site_recycling: []
      off-site_recovery: []
      off-site_treatment: []
      off-site_potws: []
      total_usage: []
      methods: []
          - each element in the methods array will have the following attributes:
          method: ''  // the method of treatment (such as A03 for scrubber)
          years: []   // the count of years in which scrubbers were present (for this chemical at this facility)

     */
});

var makeChemical = function( attrs ) {
  // set up chemical
  var c = {},
      i = 0;
  c.chemical = attrs[26];
  c.air = [];
  c.water = [];
  c.land = [];
  c.recycling = [];
  c.recovery = [];
  c.treatment = [];
  c.offsite_disposal = [];
  c.offsite_recycling = [];
  c.offsite_recovery = [];
  c.offsite_treatment = [];
  c.offsite_potws = [];
  c.total_usage = [];

  // initialize yearly chemical usage to 0
  for( i + 1987; (i + 1987) < 2014; i++ ) {
    // if( i == parseInt(attrs[0])) continue;
    c.air[i] = 0;
    c.water[i] = 0;
    c.land[i] = 0;
    c.recycling[i] = 0;
    c.recovery[i] = 0;
    c.treatment[i] = 0;
    c.offsite_disposal[i] = 0;
    c.offsite_recycling[i] = 0;
    c.offsite_recovery[i] = 0;
    c.offsite_treatment[i] = 0;
    c.offsite_potws[i] = 0;
    c.total_usage[i] = 0;
  }
  i = parseInt(attrs[0]) - 1987;
  c.air[i] = parseFloat(attrs[35]) + parseFloat(attrs[36]);
  c.water[i] = parseFloat(attrs[37]);
  for( var j = 0; j < 8; j++ )
    c.land[i] += parseFloat(attrs[j + 38]);
  c.recycling[i] = parseFloat(attrs[93]);
  c.recovery[i] = parseFloat(attrs[91]);
  c.treatment[i] = parseFloat(attrs[95]);
  c.offsite_disposal[i] = parseFloat(attrs[68]);
  c.offsite_recycling[i] = parseFloat(attrs[74]);
  c.offsite_recovery[i] = parseFloat(attrs[77]);
  c.offsite_treatment[i] = parseFloat(attrs[84]);
  c.offsite_potws[i] = parseFloat(attrs[50]);
  c.total_usage[i] = c.air[i] + c.water[i] + c.land[i] + c.recycling[i] + c.recovery[i] + c.treatment[i] +
    c.offsite_disposal[i] + c.offsite_recycling[i] + c.offsite_recovery[i] + c.offsite_treatment[i] + c.offsite_potws[i];
  return c;
};

var updateChemical = function( c, attrs ) {
  i = parseInt(attrs[0]) - 1987;
  c.air[i] += parseFloat(attrs[35]) + parseFloat(attrs[36]);
  c.water[i] += parseFloat(attrs[37]);
  for( var j = 0; j < 8; j++ )
    c.land[i] += parseFloat(attrs[j + 38]);
  c.recycling[i] += parseFloat(attrs[93]);
  c.recovery[i] += parseFloat(attrs[91]);
  c.treatment[i] += parseFloat(attrs[95]);
  c.offsite_disposal[i] += parseFloat(attrs[68]);
  c.offsite_recycling[i] += parseFloat(attrs[74]);
  c.offsite_recovery[i] += parseFloat(attrs[77]);
  c.offsite_treatment[i] += parseFloat(attrs[84]);
  c.offsite_potws[i] += parseFloat(attrs[50]);
  c.total_usage[i] += c.air[i] + c.water[i] + c.land[i] + c.recycling[i] + c.recovery[i] + c.treatment[i] +
    c.offsite_disposal[i] + c.offsite_recycling[i] + c.offsite_recovery[i] + c.offsite_treatment[i] + c.offsite_potws[i];
};

Facility.statics.construct = function( f, attrs ) {
  // set facility information
  f.tri_facility_id = attrs[1];
  f.parent_company = attrs[100];
  f.facility_name = attrs[2];
  f.street_address = attrs[3];
  f.city = attrs[4];
  f.county = attrs[5];
  f.state = attrs[6];
  f.zip = parseFloat(attrs[7]);
  f.bia_code = attrs[8];
  f.tribe = attrs[9];

  // set lat/long coordinates
  if(!attrs[10] || isNaN(parseFloat(attrs[10]))) {
    console.log('boop', attrs[10], parseFloat(attrs[10]), isNaN(parseFloat(attrs[10])));
    f.loc = null;
  }
  else if(!attrs[11] || isNaN(parseFloat(attrs[11]))) {
    console.log('boop', attrs[11], parseFloat(attrs[11]), isNaN(parseFloat(attrs[11])));
    f.loc = null;
  }
  else f.loc = [parseFloat(attrs[11]), parseFloat(attrs[10])];

  f.federal_facility = attrs[12];

  // set facility industry sector
  f.primary_sic = parseFloat(attrs[13]);
  if( isNaN(f.primary_sic) )
    f.primary_sic = null;
  f.primary_naics = (attrs[19]) ? attrs[19] : "NONE";
  if( isNaN(parseFloat(f.primary_naics)) )
    f.primary_naics = "NONE";

  // initialize facility's total usage
  f.total_usage = [];
  for( var i = 0; i < 27; i++)
    f.total_usage[i] = 0;

  // create chemicals object
  f.chemicals = {};

  // add chemical to chemicals object
  f.chemicals[attrs[27]] = makeChemical(attrs);

  // update facility's total usage for the chemical
  for( var j = 0; j < 27; j++) {
    f.total_usage[j] += f.chemicals[attrs[27]].total_usage[j];
  }

};

/*
  Update the facility with new chemical information
  Either update an extant chemical's arrays
  OR
  Add a new chemical to the map
*/
Facility.statics.modify = function( f, attrs ) {
  if( f.chemicals[ attrs[ 27 ] ] ) {
    updateChemical( f.chemicals[ attrs[ 27 ] ], attrs );

    // update facility's total usage
    for( var j = 0; j < 27; j++)
      f.total_usage[j] += f.chemicals[attrs[27]].total_usage[j];
  } else {
    f.chemicals[ attrs[ 27 ] ] = makeChemical(attrs);

    // update facility's total usage
    for( var i = 0; i < 27; i++)
      f.total_usage[i] += f.chemicals[attrs[27]].total_usage[i];
  }
};

Facility.statics.finalizeChemicals = function( f ) {
  var chemicals = [];
  for (var chem in f.chemicals) {

    if (f.chemicals.hasOwnProperty(chem)) {
      // rebox the methods object to an array
      if(f.chemicals[chem].methods) {
        var methods = [];
        for( var m in f.chemicals[chem].methods) {
          if (f.chemicals[chem].methods.hasOwnProperty(m))
            methods.push({method: m, count: f.chemicals[chem].methods[m] });
        }
        delete f.chemicals[chem].methods;

        chemicals.push({chemical: chem, usage: f.chemicals[chem], "methods": methods});
      }
      else
        chemicals.push({chemical: chem, usage: f.chemicals[chem]});

      // console.log(chemicals);
    }

  }
  f.chemicals = chemicals;
};

/*
    Add a treatment/recovery/recycling method to a facility
*/
Facility.statics.addMethod = function( f, attrs ) {
  console.log(f, attrs);
  // refactor to put logic here?
};

mongoose.model('Facility', Facility);
