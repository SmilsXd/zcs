Object.defineProperty(exports, "__esModule", { value: true });

const { state_names } = require("./data/states/names.js");
const { state_indexes } = require("./data/states/index.js");
const { state_data } = require("./data/states/data.js");

const { zip_indexes } = require("./data/zips/index.js");
const { zip_data } = require("./data/zips/data.js");
const { zips } = require("./data/zips/zips.js");

const { city_names } = require("./data/cities/names.js");
const { city_indexes } = require("./data/cities/index.js");
const { city_data } = require("./data/cities/data.js");
const { city_population } = require("./data/cities/population.js");
const { roads } = require("./data/utils/roads.js");
//optional street
var street_data, street_names, street_index;

//optional location
var mgrs_data, street_mgrs_data, util_mgrs;


function validZip(zip) {
  return zip_indexes[zip] != undefined;
}

function validState(state) {
  return state_indexes[state.toUpperCase()] != undefined;
}

function validCity(city) {
  return city_indexes[city.toUpperCase()] != undefined;
}


function getCitiesNameAndPopulationByState(state) {
  try {
    state = state.toUpperCase();
   
      var t = state_data[state_names.indexOf(state)];
      const keys = Object.keys(t);
      var tt = [];
      for (let i = 0; i < keys.length; i++) {
        const _zips = t[keys[i]];
        var zipsn = [];
        var city = {
          name: city_names[keys[i]],
          population: 0
        }
        for (let j = 0; j < _zips.length; j++) {

          if(city_names[zip_data[_zips[j]][1]] === city.name) {
          
            city.population = city_population[_zips[j]] || 0
          } else {
            console.log(city.name,city_population[_zips[j]],zips[_zips[j]])
          }
       
        }

        tt.push(city);
      }
      return tt.sort((a,b)=>b.population-a.population);
  } catch (error) {
    throw new Error("State or City Not Found");
  }
}

function getCitiesNameByState(state) {
  try {
    state = state.toUpperCase();
   
      var t = state_data[state_names.indexOf(state)];
      const keys = Object.keys(t);
      var tt = [];
      for (let i = 0; i < keys.length; i++) {
        tt.push(city_names[keys[i]]);
      }
      return tt;
  } catch (error) {
    throw new Error("State or City Not Found");
  }
 
}

function getByStateCity(state, city) {
  try {
    state = state.toUpperCase();
    if (!city) {
      var t = state_data[state_names.indexOf(state)];
      const keys = Object.keys(t);
      var tt = {};
      for (let i = 0; i < keys.length; i++) {
        const city = city_names[keys[i]];
        const _zips = t[keys[i]];
        var zipsn = [];
        for (let j = 0; j < _zips.length; j++) {
          zipsn.push(zips[_zips[j]]);
        }
        tt[city] = zipsn;
      }
      return tt;
    }
    city = city.toUpperCase();
    const _zips =
      state_data[state_names.indexOf(state)][city_names.indexOf(city)];
    var zipsn = [];
    for (let j = 0; j < _zips.length; j++) {
      zipsn.push(zips[_zips[j]]);
    }
    return zipsn;
  } catch (error) {
    throw new Error("State or City Not Found");
  }
 
}

function getByZip(zip) {
  try {
    var t = zip_data[zip_indexes[zip]];

    return {
      state: state_names[t[0]],
      city: city_names[t[1]],
    };
  } catch (error) {
    throw new Error("Zip Code Not Found");
  }
}

function getByCityState(city, state) {
  try {
  city = city.toUpperCase();

  if (!state) {
    var t = city_data[city_indexes[city]];

    var tt = {};
    for (let i = 0; i < t.length; i++) {
      const state = state_names[t[i]];
      tt[state] = getByStateCity(state, city);
    }
    return tt;
  }
  state = state.toUpperCase();
  return getByStateCity(state, city);
  } catch (error) {
    throw new Error("City or State Not Found");
  }
}

function zipLookAhead(zip, ammount = 10) {
  return _search(zips, zip, ammount);
}

function stateLookAhead(state, ammount = 10) {
  return _search(state_names, state.toUpperCase(), ammount);
}

function cityLookAhead(city, ammount = 10) {
  return _search(city_names, city.toUpperCase(), ammount);
}

function _search(arr, thing, ammount, skip = 0) {
  var t = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].startsWith(thing) && --skip <= 0) {
      t.push(arr[i]);
    }
    if (ammount && t.length >= ammount) {
      break;
    }
  }
  return t;
}

// Optional Street Functions



/**
 * Get all street numbers by street name and zip code
 * @param {*} streetName - street name
 * @param {*} zip - zip code
 * @returns 
 */
async function getStreetNumbersByNameAndZip(streetName,zip) {
  const streetIndex = street_index[streetName.toUpperCase()];
  var zipindex = zip_indexes[zip];
  var t =  JSON.parse((await street_data.get(streetIndex)).toString());
  var numbers = Object.keys(t);
  var n = [];
  for(var i = 0; i < numbers.length; i++) {
    var zips = t[numbers[i]];
    for(var j = 0; j < zips.length; j++) {
      if(zips[j] === zipindex) {
        n.push(numbers[i])
        break;
      }
    }
  }
  return n;
}

/**
 * Get all street numbers by street name
 * @param {*} streetName - street name
 * @returns 
 */
async function getStreetNumbersByName(streetName) {
  const streetIndex = street_index[streetName.toUpperCase()];
  return Object.keys(
    JSON.parse((await street_data.get(streetIndex)).toString())
  );
}

/**
 * Get all zip codes by street name
 * @param {*} streetName - street name 
 * @returns 
 */
async function getZipsByStreetName(streetName) {
  const t = JSON.parse(
    (await street_data.get(street_index[streetName.toUpperCase()])).toString()
  );
  console.log(t)
  const keys = Object.keys(t);

  var zipsn = [];

  for (let i = 0; i < keys.length; i++) {
    const streetNumbers = t[keys[i]];
    for (var j = 0; j < streetNumbers.length; j++) {
      if (
        zipsn.indexOf(zips[streetNumbers[j]]) == -1 &&
        zips[streetNumbers[j]] != undefined
      ) {
        zipsn.push(zips[streetNumbers[j]]);
      }
    }
  }

  return zipsn.sort((a,b)=>a-b);
}

/**
 * Look ahead for street names
 * @param {*} street - street name
 * @param {*} ammount - ammount of lookaheads
 */
function streetLookAhead(street, ammount = 10) {
  return _search(street_names, street.toUpperCase(), ammount);
}

/**
 *  Look ahead for street numbers
 * @param {*} number - street number
 * @param {*} street - street name
 * @param {*} ammount - ammount of lookaheads
 * @param {*} opts = state, city, skip, full_number_provided
 * @returns 
 */
async function streetNumberLookAhead(number, street, ammount = 10, opts = {}) {

opts.skip = opts.skip || 0;
opts.lookaheads = opts.lookaheads || [];

  var streets = _search(street_names, street.toUpperCase(), ammount*2, opts.skip );

  if(streets.length <= 0) {
    return opts.lookaheads;
  }

  for(var i = 0; i < streets.length; i++) {
    try {
      var t = JSON.parse((await street_data.get(street_index[streets[i]])).toString());
      var keys = null;
      if(opts.full_number_provided) {
        keys = t[`${number}`] ? [`${number}`] : [];
      } else {
        keys = _search( Object.keys(t), number);
      }

      for(var j = 0; j < keys.length; j++) {
        var streetNumber = keys[j]
        var szips = t[keys[j]];
        var nstreet = null;
        for(var k = 0; k < szips.length; k++) {
          var statecity = getByZip(zips[szips[k]])
          if(opts.lookaheads.length >= ammount) {
            break;
          }

          if((!opts.state || opts.state === statecity.state) && (!opts.city || opts.city === statecity.city) && (!opts.full_number_provided || (opts.full_number_provided && Number(streetNumber) === number)) ){
            nstreet = {
              full_address: `${streetNumber} ${streets[i]} ${statecity.city}, ${statecity.state} ${zips[szips[k]]}`,
              number: streetNumber,
              street: streets[i],
              city: statecity.city,
              state: statecity.state,
              zip: zips[szips[k]],
              street_index: street_index[streets[i]]
            } 
            opts.lookaheads.push(nstreet);
          }
        }
        if(nstreet && opts.lookaheads.length >= ammount) {
          break;
        }
      }
    } catch (error) { }
  }
  opts.skip = opts.skip+(ammount*2);
  return opts.lookaheads.length >= ammount ? opts.lookaheads.sort((a,b)=>a.street.length-b.street.length) : streetNumberLookAhead(number,street,ammount,opts);
}

// Optional Street Location Functions

/**
 *  Gets the street location in MGRS by number, street, and zip
 * @param {*} number - Street number
 * @param {*} street - Street name
 * @param {*} zip - Zip code
 * @param {*} searchNearist - (Default True) If the street number is not found, search for the nearest street number
 * @returns 
 */
async function getLocationByStreet(street, zip, searchNearist = true) {
  var t;
  street = street.toUpperCase().split(' ');
  var number = street.shift();
  street = street.join(' ');
  
  try {
    t = (await street_mgrs_data.get(`${street_index[street.toUpperCase()]}:${zip_indexes[zip]}:${number}`))
  } catch (error) {
    var temp = street.split(' ');
    var rdtype = temp.pop();

    if(roads[rdtype].full == rdtype) {
      rdtype = roads[rdtype].abbr;
    } else {
      rdtype = roads[rdtype].full;
    }

    street = temp.join(' ') + ` ${rdtype}`;
    console.log(error)
    try {
      t = (await street_mgrs_data.get(`${street_index[street.toUpperCase()]}:${zip_indexes[zip]}:${number}`))
    } catch (error) {

    }
  }

  if(!t && searchNearist) {
    var last_distance = 9999999999;
    var it = await street_mgrs_data.iterator({
      gte: `${street_index[street.toUpperCase()]}:${zip_indexes[zip]}:0`, 
      lte: `${street_index[street.toUpperCase()]}:${zip_indexes[zip]}:9999999999`
    })
    var tmp = null;
    var last_row = null;
    console.log('sdlfksd')
    while(tmp = await it.next()) {
      if(!tmp) {
        console.log('no tmp')
      }
     
      var street_num = Number(tmp[0].toString().split(':').pop());
      var distance = Math.abs(street_num - number);
      
      if(last_distance < distance) {
        it.end();
        return last_row[1].toString();
      }
      last_row = tmp;
      last_distance = distance;
    }
  } else {
    return t.toString();
  }
  return null;
}

/**
 * Gets the street location in Lat and long by number, street, and zip
 * @param {*} street - Street
 * @param {*} zip - Zip code
 * @returns 
 */
async function getLocationByStreetLL(street, zip) {
  var loc = await getStreetLocation(street, zip);
  if(loc) {
   loc = util_mgrs.toPoint(loc);
   loc = {
    lat: loc[1],
    long: loc[0]
   }
  }
  return loc;
}

/**
 * Gets all streets in the area around in the distance provided
 * @param {*} mgrs - MGRS location
 * @param {*} distance - (Default 100m) Distance in meters Allowed (100m, 1km, 10km, 100km) 
 */
async function getStreetsByLocation(mgrs, distance = '100m') {
  if(!street_index) {
    throw new Error('Requires zcs-streets module to be loaded');
  }
  mgrs = mgrs.toUpperCase();
  var tmgrs = mgrs;
  if (isNaN(mgrs[1])) {
    tmgrs = "0" + mgrs;
  }

  var block_of_mgrs = [];
  if(mgrs.length == 15){
    tmgrs = mgrs.substring(0, 3) +
    mgrs.substring(3, 5) + 
    mgrs.substring(5, 6) + 
    mgrs.substring(6, 7) + 
    mgrs.substring(7, 8) + 
    mgrs.substring(10, 11) + 
    mgrs.substring(11, 12) +
    mgrs.substring(12, 13);
  } else if(mgrs.length == 13) {
    tmgrs = mgrs.substring(0, 3) +
    mgrs.substring(3, 5) + 
    mgrs.substring(5, 6) + 
    mgrs.substring(6, 7) + 
    mgrs.substring(7, 8) + 
    mgrs.substring(9, 10) + 
    mgrs.substring(10, 11) +
    mgrs.substring(11, 12);
  }
  
  if(distance == '100m') {
    block_of_mgrs.push(tmgrs);
  }
  else if(distance == '1km') {
    var first_m = tmgrs.substring(0,7)
    var last_m = tmgrs.substring(8,10)
    for(var i = 0; i < 10; i++) {
      for(var j = 0; j < 10; j++) {
        block_of_mgrs.push(`${first_m}${i}${last_m}${j}`);
      }
    }
  }
  else if(distance == '10km') {
    var first_m = tmgrs.substring(0,6)
    var last_m = tmgrs.substring(8,9)
    for(var i = 0; i < 100; i++) {
      for(var j = 0; j < 100; j++) {
        block_of_mgrs.push(`${first_m}${i}${last_m}${j}`);
      }
    }
  }
  else if(distance == '100km') {
    var first_m = tmgrs.substring(0,5)
    var last_m = tmgrs.substring(8,8)
    for(var i = 0; i < 1000; i++) {
      for(var j = 0; j < 1000; j++) {
        block_of_mgrs.push(`${first_m}${i}${last_m}${j}`);
      }
    }
  }
  else {
    throw new Error('Invalid distance');
  }
  var streets = [];


  for (let i = 0; i < block_of_mgrs.length; i++) {
    try {
      var mgrs = block_of_mgrs[i];
      var tmp = await mgrs_data.get(mgrs);

      console.log(tmp.toString())
      await __streetsByLocationParse([mgrs,tmp], streets);
    } catch (error) {
      //console.log(error)
    }
  }
  
  return streets;
}

async function __streetsByLocationParse(tmp, streets) {
  if(!tmp) {
    console.log('no tmp')
  }
  var mgrs = tmp[0].toString();

  var tstreets = tmp[1].toString();
  if(!tstreets) {
    retrun;
  }
  tstreets = JSON.parse(tstreets);
  var street_indexes = Object.keys(tstreets);
  for(var i = 0; i < street_indexes.length; i++) {
    var street_numbers = tstreets[street_indexes[i]];
    var zip_street = street_indexes[i].split(':');
    var street_zip = zips[zip_street[1]];
    var street_name = street_names[zip_street[0]];
  
    var street_city_state = {city: 'Unknown', state: 'Unknown'};
    try {
      street_city_state = getByZip(street_zip);
    } catch (error) {}
    for(var j = 0; j < street_numbers.length; j++) {
      var street_loc = mgrs;
      try {
        street_loc = (await street_mgrs_data.get(`${street_indexes[i]}:${street_numbers[j]}`)).toString();
      } catch (error) {
        console.log(error)
      }

      streets.push({
        street:`${street_numbers[j]} ${street_name}`,
        city: street_city_state.city,
        state: street_city_state.state,
        zip: street_zip,
        location: street_loc
      })
    }
  }
}

/**
 *
 * @param {*} opts.street.enabled - if true, will enable by street searches
 * @param {*} opts.street.location - location of the zcs-streets repo
 * @param {*} opts.geo.enabled - if true, will enable geo searches
 * @param {*} opts.geo.location - location of the zcs-location repo
 * @returns
 */
exports.zcs = (opts) => {

  const functions = {
    getByCityState,
    getByZip,
    getByStateCity,
    zipLookAhead,
    stateLookAhead,
    cityLookAhead,
    validZip,
    validState,
    validCity,
    getCitiesNameByState,
    getCitiesNameAndPopulationByState
    
  };

  if (opts && opts.street && opts.street.enabled) {
    var zcs_street = require(opts.street.location).zcs_street();

    street_data = zcs_street.street_data;
    street_names = zcs_street.street_names;
    street_index = zcs_street.street_index;

    functions.getStreetNumbersByName = getStreetNumbersByName;
    functions.getStreetNumbersByNameAndZip = getStreetNumbersByNameAndZip;
    functions.getZipsByStreetName = getZipsByStreetName;
    functions.streetLookAhead = streetLookAhead;
    functions.streetNumberLookAhead = streetNumberLookAhead;
  }

  if (opts && opts.geo && opts.geo.enabled) {
    var zcs_location = require(opts.geo.location).zcs_location();

    street_mgrs_data = zcs_location.street_mgrs_data;
    mgrs_data = zcs_location.mgrs_data;
    util_mgrs = zcs_location.mgrs;
    functions.getLocationByStreet =  getLocationByStreet;
    functions.getLocationByStreetLL =  getLocationByStreetLL;
    functions.getStreetsByLocation = getStreetsByLocation;
  }

  return functions;
};
