async function myFunc() {
    const { getByStateCity, getByCityState, getByZip, zipLookAhead, cityLookAhead, stateLookAhead } = require('./index.js')
    console.log(getByCityState('Orlando'))
    console.log(getByStateCity('FL'))
    console.log(getByZip('03809'))
    console.log(zipLookAhead('038'))
    console.log(cityLookAhead('orlan'))
    console.log(stateLookAhead('N'))
}


async function myFunc() {
    const { getByStateCity, getByCityState, getByZip, zipLookAhead, cityLookAhead, stateLookAhead} = await import('./index.js')

    console.log(getByCityState('Orlando'))
    console.log(getByStateCity('FL'))
    console.log(getByZip('03809'))
    console.log(zipLookAhead('038'))
    console.log(cityLookAhead('orlan'))
    console.log(stateLookAhead('N'))
}
myFunc()