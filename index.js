Object.defineProperty(exports, "__esModule", { value: true });

const { state_names } = require("./data/states/names.js");
const { state_index } = require("./data/states/index.js");
const { state_data } = require("./data/states/data.js");

const { zip_indexes } = require("./data/zips/index.js");
const { zip_data } = require("./data/zips/data.js");
const { zips } = require("./data/zips/zips.js");

const { city_names } = require("./data/cities/names.js");
const { city_indexes } = require("./data/cities/index.js");
const { city_data } = require("./data/cities/data.js");

//optional street
var street_data, street_names, street_index;

//optional location
var mgrs_data, street_mgrs_data;

function getByStateCity(state, city) {
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
}
function getByZip(zip) {
  var t = zip_data[zip_indexes[zip]];

  return {
    state: state_names[t[0]],
    city: city_names[t[1]],
  };
}
function getByCityState(city, state) {
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
    if (t.length >= ammount) {
      break;
    }
  }
  return t;
}

// Optional Street Functions

async function getStreetNumbersByName(streetName) {
  const streetIndex = street_index[streetName.toUpperCase()];
  console.log(streetIndex, streetName);
  return Object.keys(
    JSON.parse((await street_data.get(streetIndex)).toString())
  );
}

async function getZipsByStreetName(streetName) {
  const t = JSON.parse(
    (await street_data.get(street_index[streetName.toUpperCase()])).toString()
  );
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

  return zipsn;
}

function streetLookAhead(street, ammount = 10) {
  return _search(street_names, street.toUpperCase(), ammount);
}

async function streetNumberLookAhead(number, street, ammount = 10, state = null, city = null, skip = 0, lookaheads=[]) {

  var streets = _search(street_names, street.toUpperCase(), ammount*2, skip);
  if(streets.length <= 0) {
    return lookaheads;
  }
 // console.log(streets)
  for(var i = 0; i < streets.length; i++){
    var t = JSON.parse((await street_data.get(street_index[streets[i]])).toString());
    //console.log(t)
    var keys =_search( Object.keys(t), number, ammount*2);
    //console.log(keys)
    for(var j = 0; j < keys.length; j++) {
      var streetNumber = keys[j]
      var szips = t[keys[j]];
      var nstreet = null;
      for(var k = 0; k < szips.length; k++) {
        var statecity = getByZip(zips[szips[k]])
        if(lookaheads.length >= ammount) {
          break;
         }
        if((!state || state === statecity.state) && (!city || city === statecity.city) ){
          nstreet = {
            number: streetNumber,
            street: streets[i],
            city: statecity.city,
            state: statecity.state,
            zip: zips[szips[k]],
            street_index: street_index[streets[i]]
          } 
          lookaheads.push(nstreet);
        }
      }
      if(nstreet && lookaheads.length >= ammount) {
        break;
      }
    }
  }

  return lookaheads.length >= ammount ? lookaheads : streetNumberLookAhead(number,street,ammount,state,city,skip+(ammount*2),lookaheads);
}

// Optional Street Location Functions

async function getStreetLocation(number, street, zip) {
  var t = 
    (await street_mgrs_data.get(`${street_index[street.toUpperCase()]}:${zip_indexes[zip]}:${number}`)).toString()
 
  console.log(t);
  // var keys = Object.keys(t);
  // for (let i = 0; i < keys.length; i++) {
  //   if (keys[i] == number) {
  //     var szips = t[keys[i]];
  //     for (var j = 0; j < szips.length; j++) {
  //       var statecity = getByZip(zips[szips[j]]);
  //       if (statecity.state == state && statecity.city == city) {
  //         return {
  //           number: number,
  //           street: street,
  //           city: statecity.city,
  //           state: statecity.state,
  //           zip: zips[szips[j]],
  //           street_index: street_index[street],
  //         };
  //       }
  //     }
  //   }
  // }
  return null;
}

/**
 *
 * @param {*} opts
 * @param {*} opts.street.enabled - if true, will enable by street searches
 * @param {*} opts.street.location - location o f the zcs-streets repo
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
  };

  if (opts && opts.street && opts.street.enabled) {
    var zcs_street = require(opts.street.location).zcs_street();

    street_data = zcs_street.street_data;
    street_names = zcs_street.street_names;
    street_index = zcs_street.street_index;

    functions.getStreetNumbersByName = getStreetNumbersByName;
    functions.getZipsByStreetName = getZipsByStreetName;
    functions.streetLookAhead = streetLookAhead;
    functions.streetNumberLookAhead = streetNumberLookAhead;
  }


  if (opts && opts.geo && opts.geo.enabled) {
    var zcs_location = require(opts.geo.location).zcs_location();

    street_mgrs_data = zcs_location.street_mgrs_data;
    mgrs_data = zcs_location.mgrs_data;

    functions.getStreetLocation = getStreetLocation;
  }


  return functions;
};
