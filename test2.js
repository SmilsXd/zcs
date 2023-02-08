// async function myFunc() {
//   const {
//     getByStateCity,
//     getByCityState,
//     getByZip,
//     zipLookAhead,
//     cityLookAhead,
//     stateLookAhead,
//     getStreetNumbersByName,
//     getZipsByStreetName,
//   } = require("./index.js");
//   console.log(getByCityState("Orlando"));
//   console.log(getByStateCity("FL"));
//   console.log(getByZip("03809"));
//   console.log(zipLookAhead("038"));
//   console.log(cityLookAhead("orlan"));
//   console.log(stateLookAhead("N"));
//   console.log(await getStreetNumbersByName("ORANGE STREET"));
//   console.log(await getZipsByStreetName("DUDLEY ROAD"));
// }



async function myFunc() {
var zcta = require("../zcs-location/location/zip/index.js");


console.log(zcta.geoMGRSSearchZip('12SYE3470740998'));

}
myFunc();
