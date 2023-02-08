const {
  getByStateCity,
  getByCityState,
  getByZip,
  zipLookAhead,
  cityLookAhead,
  stateLookAhead,
  getStreetNumbersByName,
  getZipsByStreetName,
  streetLookAhead,
  streetNumberLookAhead,
  getStreetLocation
} = (require("./index.js")).zcs({
  //street: { enabled: true, location: process.cwd() + "/../zcs-streets/index.js" },
  //geo: { enabled: true, location: process.cwd() + "/../zcs-location/index.js" },
});

async function myFunc() {
  console.log(getByCityState("Orlando"));
  console.log(getByStateCity("FL"));
  console.log(getByZip("03809"));
  console.log(zipLookAhead("038"));
  console.log(cityLookAhead("orlan"));
  console.log(stateLookAhead("N"));
  // console.log(await getStreetNumbersByName("ORANGE STREET"));
  // console.log(await getZipsByStreetName("DUDLEY ROAD"));
  // console.log(streetLookAhead("DUDL"));
  //console.log((await streetNumberLookAhead(294,"DUDLEY ROAD",10)));
  // console.log((await streetNumberLookAhead(29,"DUDLEY",10,'NH')));
  //var street = (await streetNumberLookAhead(294,"DUDLEY ROAD",1,'NH', 'ALTON'));
 // console.log (await getStreetLocation(101,"ABILENE STREET",'76801'));
}

// }
myFunc();
