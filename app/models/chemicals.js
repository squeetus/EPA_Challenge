/**
 * This defines the Facilities class
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Chemical = new Schema ({
    chemical:                 {type: String, default: ''},
    cas:                      {type: String, default: ''},
    info: {
      clean_air_act:            {type: String, default: ''},
      classification:           {type: String, default: ''},
      metal:                    {type: String, default: ''},
      metal_category:           {type: Number, default: 0},
      carcinogen:               {type: String, default: ''},
      measurement:              {type: String, default: ''}
    },
    air: [],
    water: [],
    land: [],
    recycling: [],
    recovery: [],
    treatment: [],
    offsite_disposal: [],
    offsite_recycling: [],
    offsite_recovery: [],
    offsite_treatment: [],
    offsite_potws: []
});

/*
  Create a new Chemical instance
*/
Chemical.statics.construct = function( c, attrs ) {
    var i = 0;
    c.chemical = attrs[26];
    c.cas = attrs[27];
    c.info = {};
    c.info.clean_air_act = attrs[28];
    c.info.classification = attrs[29];
    c.info.metal = attrs[30];
    c.info.metal_category = parseFloat(attrs[31]);
    if( isNaN(c.info.metal_category))
      c.info.metal_category = null;
    c.info.carcinogen = attrs[32];
    c.info.measurement = attrs[34];

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
};

Chemical.statics.modify = function( c, attrs ) {
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
};


mongoose.model('Chemical', Chemical);
