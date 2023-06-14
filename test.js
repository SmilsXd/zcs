const {
  getByStateCity,
  getByCityState,
  getByZip,
  zipLookAhead,
  cityLookAhead,
  stateLookAhead,
  validCity,
  validState,
  validZip,
  getCitiesNameByState,
  getCitiesNameAndPopulationByState,
  getStreetsbyStateAndCity,
  getStreetsbyZip,
  getStreetNumbersByName,
  getStreetNumbersByNameAndZip,
  getZipsByStreetName,
  streetLookAhead,
  streetNumberLookAhead,
  getLocationByStreet,
  getLocationByStreetLL,
  getStreetsByLocation
} = (require("./index.js")).zcs({
  street: { enabled: true, location: process.cwd() + "/../zcs-streets/index.js" },
   geo: { enabled: true, location: process.cwd() + "/../zcs-location/index.js" },
});

async function myFunc() {
  // console.log(getByCityState("Orlando"));
   console.log(getByStateCity("NY", "New York"));
  // console.log(getCitiesNameByState("FL").length);
   //console.log(getCitiesNameAndPopulationByState("FL").length);
  // console.log(getByZip("03809"));
  // console.log(zipLookAhead("038"));
  // console.log(cityLookAhead("Orland"));
  // console.log(stateLookAhead("N"));
  // console.log(getByCityState("Bow", "NH"));
  // console.log(validZip("03809"));
  // console.log(validZip("038309"));
  // console.log(validState("FL"));
  // console.log(validState("FLA"));
  // console.log(validCity("Orlando"));
  // console.log(validCity("OrlandFAS"));
   //console.log(getByZip("10001"));
  //console.log(await getStreetNumbersByName("ORANGE STREET"));
  //console.log(await getStreetsbyZip("10001"));
  console.log(await getStreetsbyStateAndCity("FL","ORLANDO"));
  //console.log(await getStreetNumbersByNameAndZip("AEIN ROAD", "32817"));
  //console.log(await getZipsByStreetName("DUDLEY ROAD"));
  //console.log(streetLookAhead("AEIN ROAD"));
  //console.log((await streetNumberLookAhead(29,"AEIN RO",10)));
 // console.log((await streetNumberLookAhead(294,"DUDLEY R",20,{full_number_provided:true})));
  //console.log((await streetNumberLookAhead(294,"DUDLEY ROAD",10000,'NH')));
  //console.log((await streetNumberLookAhead(290,"AEIN ROAD",10,'FL')));
 //console.log (await getStreetsByLocation('19TCJ1768908395','100m'));
 //console.log (await getLocationByStreet("25 W 31st St",'10001', false));
}

// }
myFunc();
