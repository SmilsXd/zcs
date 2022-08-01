async function myFunc() {
    const { getByStateCity, getByCityState, getByZip, zipLookAhead, cityLookAhead, stateLookAhead, getStreetNumbersByName, getZipsByStreetName } = require('./index.js')
    // console.log(getByCityState('Orlando'))
    // console.log(getByStateCity('FL'))
    // console.log(getByZip('03809'))
    // console.log(zipLookAhead('038'))
    // console.log(cityLookAhead('orlan'))
    // console.log(stateLookAhead('N'))
    console.log(getStreetNumbersByName('0RANGE ST.'))
    // console.log(getZipsByStreetName('0RANGE ST.'))
}


async function myFunc() {
    const { getByStateCity, getByCityState, getByZip, zipLookAhead, cityLookAhead, stateLookAhead, getStreetNumbersByName, getZipsByStreetName } = await import('./index.js')

    // console.log(getByCityState('Orlando'))
    // console.log(getByStateCity('FL'))
    // console.log(getByZip('03809'))
    // console.log(zipLookAhead('038'))
    // console.log(cityLookAhead('orlan'))
    // console.log(stateLookAhead('N'))
    console.log(getStreetNumbersByName('0RANGE ST.'))
    // console.log(getZipsByStreetName('0RANGE ST.'))
}
myFunc()