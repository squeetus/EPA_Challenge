var mongoose = require('mongoose'),
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
        // finalize();
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
      if( splitLine[27]  !== '') {  // ignore facilities with no chemical (fixes small bug)
        // create new facility if it doesn't exist in facility map
        if( facilities[ splitLine[ 1 ] ] === undefined ) {
          facilities[ splitLine[ 1 ] ] = {};
          Facility.construct( facilities[ splitLine[ 1 ] ], splitLine );
          if(isNaN(facilities[ splitLine [ 1 ] ].zip) )
            console.log(facilities[ splitLine [ 1 ] ]);
        } else {  // update existing facility
          Facility.modify( facilities[ splitLine[ 1 ] ], splitLine );
        }
      }

      /* Process Chemical */
      // create new chemical if it doesn't exist in chemical map
      if( chemicals[ splitLine[ 27 ] ] === undefined ) {
        chemicals[ splitLine[ 27 ] ] = {};
        Chemical.construct( chemicals[ splitLine[ 27 ] ], splitLine );
      } else {  // update existing chemical
        Chemical.modify( chemicals[ splitLine[ 27 ] ], splitLine );
      }
    });

    /* Handle end of file condition */
    rl.on('close', function() {
      console.log( "fin: ", i, " lines from ", fileNumber);
      console.log( "unique facilities: ", Object.keys(facilities).length);
      console.log( "unique chemicals: ", Object.keys(chemicals).length);

      /* Read the relevant Form R file for scrubber (etc) data */
      exports.readFormRFiles(fileNumber);
      parseFile( ++fileNumber );
    });
  };  // parse file

  // read all TRI Basic files one by one, aggregating info by facility and chemical
  parseFile( 1987 );

};



////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
      R E A D   F O R M - R   F I L E S

      readFormRFiles() attempts to opens and parse all TRI Form R tsv files
*/
////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.readFormRFiles = function( fileNumber ) {

  /*
   local method to parse a particular TRI Basic file
  */
  var parseFile = function( fileNumber ) {
    console.log("\n\nStarting Form R: ", fileNumber);
    var attrs = [], // count the number of attributes in each record
        i = 0,
        rs = fs.createReadStream( 'data/FormR/US_2b_' + fileNumber + '_v13.txt'),
        rl = readline.createInterface({
          input: rs
        });

    /* Handle error from fs.createReadStream. File not found. */
    rs.on('error', function( e ) {
      if ( e.code === 'ENOENT' ) {
        console.log( 'File not found: ', e.path );
        // finalize();
        return;
      } else {
        throw e;
      }
    });

    /* Read and handle each line one by one */
    rl.on('line', function( line ) {
      if(i++ === 0)
        return;
      var flag = false,
        splitLine = line.split("\t"),
        fID, cas,
        wasteStreams = {
          "A": true,
          "W": true,
          "L": true,
          "S": true
        };

      fID = splitLine[2];   // get tri_facility_id
      cas = splitLine[41];  // get cas number

      while(cas.charAt(0) == '0') cas = cas.substring(1); // trim 0s from beginning of cas

      // ensure facility and chemical exist
      // if( !facilities[ fID ] ) console.log(fID);
      // if( !chemicals[ cas ] ) console.log( fID, cas, facilities[ fID ], chemicals[ cas ] );
      if( facilities[ fID ] && facilities[ fID ].chemicals[ cas ] ) {

          // ensure at least one method exists
          for( var k = 62; k < 120; k += 12 ) {
            // check if a waste stream exists
      			if( wasteStreams[ splitLine[ k ] ] ) {
              // look for a treatment method
              for( var j = k+1; j < k + 8 ; j++ ) {
       					if( ( splitLine[ j ] ) && splitLine[ j ].charAt( 0 ) == 'A'  ) {  // only look for A01-A07

                  // Handle facility model
                  // if the chemical does not have a methods attribute, create it and add the current method
                  if( !facilities[ fID ].chemicals[ cas ].methods ) {
                    facilities[ fID ].chemicals[ cas ].methods = {};
                    facilities[ fID ].chemicals[ cas ].methods[ splitLine[ j ] ] = {};
                    facilities[ fID ].chemicals[ cas ].methods[ splitLine[ j ] ] = getBlankArray();
                    facilities[ fID ].chemicals[ cas ].methods[ splitLine[ j ] ][fileNumber - 1987 ] = 1;

                    // set up a total scrubber usage
                    facilities[ fID ].chemicals[ cas ].methods.total = {};
                    facilities[ fID ].chemicals[ cas ].methods.total = getBlankArray();
                    facilities[ fID ].chemicals[ cas ].methods.total[fileNumber - 1987 ] = 1;

                  // if the chemical has a methods attribute but not the relevant current method
                  } else if( !facilities[ fID ].chemicals[ cas ].methods[  splitLine[ j ] ] ) {
                    facilities[ fID ].chemicals[ cas ].methods[ splitLine[ j ] ] = {};
                    facilities[ fID ].chemicals[ cas ].methods[ splitLine[ j ] ] = getBlankArray();
                    facilities[ fID ].chemicals[ cas ].methods[ splitLine[ j ] ][fileNumber - 1987 ] = 1;

                    // add to total
                    facilities[ fID ].chemicals[ cas ].methods.total[fileNumber - 1987 ]++;

                  // otherwise, the chemical has a methods attribute and the relevant method
                  } else {
                    facilities[ fID ].chemicals[ cas ].methods[ splitLine[ j ] ][fileNumber - 1987 ]++;

                    // add to total
                    facilities[ fID ].chemicals[ cas ].methods.total[fileNumber - 1987 ]++;
                  }

                  // CHEM
                  // if the chemical exists with no methods object, create a new object
                  // if the chemical exists with a methods object, simply add to methods object

                }
              }
            }
		      }
      }

    });

    /* Handle end of file condition */
    rl.on('close', function() {
      // console.log(lengths);
      console.log( "fin: ", i, " lines from Form R", fileNumber);
      if(fileNumber >= 2013) finalize();  // call finalize when finished
    });
  };  // parse file

  // read the specified TRI Form R file
  parseFile( fileNumber );

};

var finalize = function() {
  var facs = [],
      chems = [];
  // convert collection of facilities and chemicals into arrays
  for( var f in facilities ) {
    Facility.finalizeChemicals( facilities[ f ] );
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
