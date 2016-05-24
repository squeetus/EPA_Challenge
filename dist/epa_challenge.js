var mongoose = require('mongoose'),
    Chemical = mongoose.model('Chemical');

exports.chemicals = function(req, res, next) {
    var limit = (req.query.limit && req.query.limit < 1000) ? req.query.limit : 10;

    Chemical
        .find({

        })
        .limit(limit)
        .exec(function (err, data) {
            if (err) return next(err);
            if (!data)
                return next("no data");
            res.json(data);
    });
};

exports.chemical = function(req, res, next) {
    Chemical
        .findOne({
            cas: req.params.cas
        })
        .exec(function (err, data) {
            if (err) return next(err);
            if (!data)
                return next("no data for chemical with cas " + req.params.cas);
            res.json(data);
    });
};
;var mongoose = require('mongoose'),
    Facility = mongoose.model('Facility'),
    Chemical = mongoose.model('Chemical'),
    readline = require( 'readline' ),
    fs = require( 'fs' ),
    facilities = {},  // collection of all facility
    chemicals = {};   // collection of all cheical objects
////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
    L O C A L    M E T H O D S
*/
////////////////////////////////////////////////////////////////////////////////////////////////////////////

var getBlankArray = function() {
  var A = [];
  for( var i = 0; i < 27; i++ )
    A.push(0);
  return A;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////


exports.clearDBS = function() {
  Facility.find().remove(function(e) {
    console.log('cleared facilities');
  });
  //
  // Chemical.find().remove(function(e) {
  //   console.log('cleared chemicals');
  // });
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.testFacility = function() {
    // Facility.find().remove(function(e) {
    //   console.log('cleared facilities');
    // });

    var f = new Facility();
    f.facility_name = "testFacility";
    f.tri_facility_id = 22222;
    f.parent_company = "parent company";
    f.street_address = "123 road";
    f.city = "a city";
    f.county = "a county";
    f.state = "a state";
    f.zip = 12345;
    f.bia_code = 1;
    f.tribe = "maybe tribe";
    f.loc = [-33.98, 75.35];
    f.federal_facility = "NO";
    f.primary_sic = 1234;
    f.primary_naics = 4321;
    f.chemicals = [];
    f.chemicals.push({
      air: [0, 0, 0],
      water: [0, 1, 0],
      land: [0, 0, 1],
      recycling: [0, 0, 0],
      recovery: [0, 0, 0],
      treatment: [0, 0, 0],
      offsite_disposal: [0, 1, 0],
      offsite_recovery: [1, 1, 0],
      offsite_recycling: [-1, 0, 1],
      offsite_treatment: [0, 1, 1],
      offsite_potws: [0, 0, 0]
    });
    f.save();
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.testChemical = function() {
    Chemical.find().remove(function(e) {
      console.log('cleared chemicals');
    });

    var c = new Chemical();
    c.chemical = "a Chemical";
    c.cas = "N100";
    c.info.clean_air_act = "NO";
    c.info.classification = "TRI";
    c.info.metal = "NO";
    c.info.metal_category = 0;
    c.info.carcinogen = "NO";
    c.info.measurement = "Pounds";
    c.air = getBlankArray();
    c.water = getBlankArray();
    c.land = getBlankArray();
    c.recycling = getBlankArray();
    c.recovery = getBlankArray();
    c.treatment = getBlankArray();
    c.offsite_disposal = getBlankArray();
    c.offsite_recycling = getBlankArray();
    c.offsite_recovery = getBlankArray();
    c.offsite_treatment = getBlankArray();
    c.offsite_potws = getBlankArray();
    c.save();
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
  read() attempts to opens the TRI Basic tsv file with the specified year
  argument: Integer year
  attempts to open file: data/TRI_{{year}}_US.txt
*/
exports.read = function( year ) {
  year = ( year ) ? year : 1987;   // set default value for year if no arg present
  var i = 0,  // count the number of lines in the file
  attrs = [], // count the number of attributes in each record
  rs = fs.createReadStream( 'data/TRI_' + year + '_US.txt' ),
  rl = readline.createInterface({
    input: rs
  });

  /* Handle error from fs.createReadStream. File not found. */
  rs.on('error', function( e ) {
    if ( e.code === 'ENOENT' ) {
      console.log( 'File not found: ', e.path );
    } else {
      console.log(":(");
      throw e;
    }
    return;
  });

  /* Read and handle each line one by one */
  rl.on('line', function( line ) {
    var flag = false;

    /* Save the number of attributes in an array of lengths */
    if(attrs.length === 0)
      attrs.push(line.split("\t").length);
    for(var k = 0; k < attrs.length; k++) {
      if(attrs[k] == line.split("\t").length) {
        flag = true;
        break;
      }
    }
    if( !flag ) attrs.push(line.split("\t").length);

    i++;
  });

  /* Handle end of file condition */
  rl.on('close', function() {
    console.log( "fin: ", i, " lines" );
    console.log( "record lengths: ", attrs );
  });
};



////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
      R E A D   F I L E S

      readFiles() attempts to opens and parse all TRI Basic tsv files
*/
////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.readFiles = function(  ) {

  facilities = {};
  chemicals = {};

  /*
   local method to parse a particular TRI Basic file
  */
  var parseFile = function( fileNumber ) {
    console.log("\n\nStarting", fileNumber);
    var attrs = [], // count the number of attributes in each record
        i = 0,
        rs = fs.createReadStream( 'data/TRI_' + fileNumber + '_US.txt' ),
        rl = readline.createInterface({
          input: rs
        });

    /* Handle error from fs.createReadStream. File not found. */
    rs.on('error', function( e ) {
      if ( e.code === 'ENOENT' ) {
        console.log( 'File not found: ', e.path );
        finalize();
        return;
      } else {
        throw e;
      }
    });

    /* Read and handle each line one by one */
    rl.on('line', function( line ) {
      if(i++ === 0)
        return;
      // i++;  // increment count of lines
      var flag = false,
        splitLine = line.split("\t");

      // account for erroneous quotation mark causing lines to be too long
      if( splitLine.length == 103 ) {
        splitLine.splice(101, 1);
        splitLine[100] = splitLine[100].substring(1);
      }

      /* Process Facility */
      // create new facility if it doesn't exist in facility map
      if( facilities[ splitLine[ 1 ] ] === undefined ) {
        facilities[ splitLine[ 1 ] ] = {};
        Facility.construct( facilities[ splitLine[ 1 ] ], splitLine );
        if(isNaN(facilities[ splitLine [ 1 ] ].zip) )
          console.log(facilities[ splitLine [ 1 ] ]);
      } else {  // update existing facility
        Facility.modify( facilities[ splitLine[ 1 ] ], splitLine );
      }

      // /* Process Chemical */
      // // create new chemical if it doesn't exist in chemical map
      // if( chemicals[ splitLine[ 27 ] ] === undefined ) {
      //   chemicals[ splitLine[ 27 ] ] = {};
      //   Chemical.construct( chemicals[ splitLine[ 27 ] ], splitLine );
      // } else {  // update existing chemical
      //   Chemical.modify( chemicals[ splitLine[ 27 ] ], splitLine );
      // }
    });

    /* Handle end of file condition */
    rl.on('close', function() {
      console.log( "fin: ", i, " lines from ", fileNumber);
      console.log( "unique facilities: ", Object.keys(facilities).length);
      console.log( "unique chemicals: ", Object.keys(chemicals).length);
      parseFile( ++fileNumber );
    });
  };  // parse file

  // read all TRI Basic files one by one, aggregating info by facility and chemical
  parseFile( 1987 );

};

var finalize = function() {
  var facs = [],
      chems = [];
  // convert collection of facilities and chemicals into arrays
  for( var f in facilities ) {
    facs.push( facilities[ f ] );
  }
  // for( var c in chemicals ) {
  //   chems.push( chemicals[ c ] );
  // }

  console.log(facs.length);//, chems.length);

  var i = 0;
  var insertAllFacilities = function( i ) {
    console.log("beginning set starting at ", i * 1000 );
    Facility.insertMany(facs.slice(i * 1000, (i * 1000) + 1000), function(err) {
      console.log( err, 'inserted facs', i * 1000, "-", (i * 1000) + 1000);
      if( i < 59)
        insertAllFacilities( ++i );
    });
  };
  insertAllFacilities( i );

  // Chemical.insertMany(chems, function(err) {
  //   console.log( err, 'inserted chems');
  // });
  // store the arrays in the respective DB tables
};
;var mongoose = require('mongoose'),
    Facility = mongoose.model('Facility');

exports.facilities = function(req, res, next) {
    var limit = (req.query.limit && req.query.limit < 100) ? req.query.limit : 1,
        chemicals = (req.query.chemicals) ? req.query.chemicals : false;

    Facility
        .find({

        },
        {
          chemicals: chemicals
        })
        .limit(limit)
        .exec(function (err, data) {
            if (err) return next(err);
            if (!data)
                return next("no data");
            res.json(data);
    });
};

exports.facility = function(req, res, next) {
    Facility
        .findOne({
            tri_facility_id: req.params.fid
        })
        .exec(function (err, data) {
            if (err) return next(err);
            if (!data)
                return next("no data for facility with facility id " + req.params.fid);
            res.json(data);
    });
};
;/**
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
;/**
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
    primary_naics:      {type: Number, default: 0},
    chemicals:          {}
    /* each element in the chemicals array will have the following attributes:
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
};



Facility.statics.construct = function( f, attrs ) {
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

  f.primary_sic = parseFloat(attrs[13]);
  if( isNaN(f.primary_sic) )
    f.primary_sic = null;
  f.primary_naics = (attrs[19]) ? parseFloat(attrs[19]) : -1;
  if( isNaN(f.primary_naics) )
    f.primary_naics = null;

  f.chemicals = {};

  f.chemicals[attrs[27]] = makeChemical(attrs);

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
  } else {
    f.chemicals[ attrs[ 27 ] ] = makeChemical(attrs);
  }
};


mongoose.model('Facility', Facility);
