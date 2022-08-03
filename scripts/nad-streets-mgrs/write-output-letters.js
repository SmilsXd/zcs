const { POSTGRESQL_CONN, LOG_INTERVAL } = require("./index");

const fs = require("fs");
const fsproms = require("fs/promises");
const { Client } = require("pg");
const client = new Client({ connectionString: POSTGRESQL_CONN });
client.connect();

const QueryStream = require("pg-query-stream");

// Keep track of elapsed time
let start = process.hrtime();

let elapsedTime = function () {
  const precision = 3; // 3 decimal places
  const elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
  return process.hrtime(start)[0] + " s, " + elapsed.toFixed(precision) + " ms";
};

const stats = {
  records: 0,
  uniqueNames: 0,
};

function displayStats() {
  const heapUsed = process.memoryUsage().heapUsed / 1024 / 1024;

  process.stdout.write(
    `\rProcessed ${stats.records} records. Unique names: ${
      stats.uniqueNames
    } Elapsed: ${elapsedTime()}. Heap used: ${
      Math.round(heapUsed * 100) / 100
    }MB`
  );
}

async function writeOut() {
  console.log("\nWriting out data...");

  // remove data from any previous runs
  await fsproms.writeFile(process.cwd() + "/output/street-names.js", "");
  await fsproms.writeFile(process.cwd() + "/output/streets-index.js", "");
  await fsproms.writeFile(process.cwd() + "/output/street-data.js", "");
  await fsproms.writeFile(process.cwd() + "/output/mgrs.js", "");
  await fsproms.writeFile(process.cwd() + "/output/stats.csv", "");

  // open write streams
  const streetNamesStream = fs.createWriteStream(
    process.cwd() + "/output/street-names.js"
  );

  const streetIndexStream = fs.createWriteStream(
    process.cwd() + "/output/streets-index.js"
  );

  const streetDataStream = {
    a: fs.createWriteStream(process.cwd() + "/output/street-data/a.js"),
    b: fs.createWriteStream(process.cwd() + "/output/street-data/b.js"),
    c: fs.createWriteStream(process.cwd() + "/output/street-data/c.js"),
    d: fs.createWriteStream(process.cwd() + "/output/street-data/d.js"),
    e: fs.createWriteStream(process.cwd() + "/output/street-data/e.js"),
    f: fs.createWriteStream(process.cwd() + "/output/street-data/f.js"),
    g: fs.createWriteStream(process.cwd() + "/output/street-data/g.js"),
    h: fs.createWriteStream(process.cwd() + "/output/street-data/h.js"),
    i: fs.createWriteStream(process.cwd() + "/output/street-data/i.js"),
    j: fs.createWriteStream(process.cwd() + "/output/street-data/j.js"),
    k: fs.createWriteStream(process.cwd() + "/output/street-data/k.js"),
    l: fs.createWriteStream(process.cwd() + "/output/street-data/l.js"),
    m: fs.createWriteStream(process.cwd() + "/output/street-data/m.js"),
    n: fs.createWriteStream(process.cwd() + "/output/street-data/n.js"),
    o: fs.createWriteStream(process.cwd() + "/output/street-data/o.js"),
    p: fs.createWriteStream(process.cwd() + "/output/street-data/p.js"),
    q: fs.createWriteStream(process.cwd() + "/output/street-data/q.js"),
    r: fs.createWriteStream(process.cwd() + "/output/street-data/r.js"),
    s: fs.createWriteStream(process.cwd() + "/output/street-data/s.js"),
    t: fs.createWriteStream(process.cwd() + "/output/street-data/t.js"),
    u: fs.createWriteStream(process.cwd() + "/output/street-data/u.js"),
    v: fs.createWriteStream(process.cwd() + "/output/street-data/v.js"),
    w: fs.createWriteStream(process.cwd() + "/output/street-data/w.js"),
    x: fs.createWriteStream(process.cwd() + "/output/street-data/x.js"),
    y: fs.createWriteStream(process.cwd() + "/output/street-data/y.js"),
    z: fs.createWriteStream(process.cwd() + "/output/street-data/z.js"),
  };

  const statsStream = fs.createWriteStream(process.cwd() + "/output/stats.csv");

  streetNamesStream.write(`module.exports = [\n`);
  streetIndexStream.write(`module.exports = {\n`);
  streetDataStream.write(`module.exports = [\n`);

  const query = new QueryStream("select * from data order by name");
  client.query(query);

  let count = 0;
  let index = {
    a: 0,
    b: 0,
    c: 0,
    d: 0,
    e: 0,
    f: 0,
    g: 0,
    h: 0,
    i: 0,
    j: 0,
    k: 0,
    l: 0,
    m: 0,
    n: 0,
    o: 0,
    p: 0,
    q: 0,
    r: 0,
    s: 0,
    t: 0,
    u: 0,
    v: 0,
    w: 0,
    x: 0,
    y: 0,
    z: 0,
  };

  let streetName = "";
  let streetData = {};
  let mgrsData = {};

  for await (const street of query) {
    if (count === 0) streetName = street.name;

    if (street.name !== streetName) {
      const letter = streetName[0];

      streetDataStream[letter].write(
        `${index[letter] === 0 ? "" : ",\n"}${JSON.stringify(streetData)}`
      );

      // Write unique street names to file
      streetNamesStream.write(
        `${index[letter] === 0 ? "" : ",\n"}"${streetName}"`
      );

      // write street indexes to file
      streetIndexStream.write(
        `${index[letter] === 0 ? "" : ",\n"}"${streetName}":${Number.parseInt(
          index[letter]
        )}`
      );

      // Gather stats
      const streetNums = Object.keys(streetData);
      let highestZipCount = 0;

      for (let i = 0; i < streetNums.length; i++) {
        const zips = streetData[streetNums[i]];
        if (zips.length > highestZipCount) highestZipCount = zips.length;
      }

      // write out stats - street name, street numbers count, highest zip count
      statsStream.write(
        `${streetName},${streetNums.length},${highestZipCount}\n`
      );

      // Reset
      index[letter]++;
      streetName = street.name;
      streetData = {};
    }

    street.zip_index = Number.parseInt(street.zip_index);

    if (!streetData[street.number]) {
      streetData[street.number] = [street.zip_index];
    }

    if (streetData[street.number].indexOf(street.zip_index) < 0) {
      streetData[street.number].push(street.zip_index);
    }

    //////////
    // MGRS DATA
    // Split into 4 parts
    // let mgrsParts = ["", "", "", ""];

    // let j;
    // for (j = 0; j < street.mgrs.length; j++) {
    //   if (j < 3) {
    //     mgrsParts[0] += street.mgrs[j];
    //   } else if (j >= 3 && j < 5) {
    //     mgrsParts[1] += street.mgrs[j];
    //   } else if (j >= 5 && j < 10) {
    //     mgrsParts[2] += street.mgrs[j];
    //   } else if (j >= 10 && j < 15) {
    //     mgrsParts[3] += street.mgrs[j];
    //   }
    // }

    // if (!mgrsData[mgrsParts[0]]) {
    //   mgrsData[mgrsParts[0]] = {};
    // }

    // if (!mgrsData[mgrsParts[0]][mgrsParts[1]]) {
    //   mgrsData[mgrsParts[0]][mgrsParts[1]] = {};
    // }

    // if (!mgrsData[mgrsParts[0]][mgrsParts[1]][mgrsParts[2]]) {
    //   mgrsData[mgrsParts[0]][mgrsParts[1]][mgrsParts[2]] = {};
    // }

    // if (!mgrsData[mgrsParts[0]][mgrsParts[1]][mgrsParts[2]][mgrsParts[3]]) {
    //   mgrsData[mgrsParts[0]][mgrsParts[1]][mgrsParts[2]][mgrsParts[3]] = [
    //     index,
    //   ];
    // } else {
    //   // Only push unique indices
    //   if (
    //     mgrsData[mgrsParts[0]][mgrsParts[1]][mgrsParts[2]][
    //       mgrsParts[3]
    //     ].indexOf(index) < 0
    //   ) {
    //     mgrsData[mgrsParts[0]][mgrsParts[1]][mgrsParts[2]][mgrsParts[3]].push(
    //       index
    //     );
    //   }
    // }

    count++;

    // Display current stats
    if (count % LOG_INTERVAL === 0) {
      stats.records = count;
      stats.uniqueNames = index + 1;
      displayStats();
    }
  }

  // Write street data to file one last time
  streetDataStream.write(`${JSON.stringify(streetData)}\n`);

  // Write unique street names to file
  streetNamesStream.write(`${index === 0 ? "" : ","}"${streetName}"`);

  // write street indexes to file
  streetIndexStream.write(
    `${index === 0 ? "" : ","}"${streetName}":${Number.parseInt(index)}`
  );

  streetNamesStream.write(`\n]`);
  streetIndexStream.write(`\n}`);
  streetDataStream.write(`]`);

  // Write MGRS data
  const mgrsStream = fs.createWriteStream(process.cwd() + "/output/mgrs.js");

  mgrsStream.write(`module.exports = {\n`);

  const mgrsKeys = Object.keys(mgrsData);

  let i = 0;
  let j = 0;
  let k = 0;
  for (i = 0; i < mgrsKeys.length; i++) {
    const levelOne = mgrsKeys[i];
    const secondKeys = Object.keys(mgrsData[levelOne]);

    mgrsStream.write(`${i === 0 ? "" : ","}"${levelOne}":{`);

    for (j = 0; j < secondKeys.length; j++) {
      const levelTwo = secondKeys[j];
      const ThirdKeys = Object.keys(mgrsData[levelOne][levelTwo]);

      mgrsStream.write(`${j === 0 ? "" : ","}"${levelTwo}":{`);

      for (k = 0; k < ThirdKeys.length; k++) {
        const levelThree = ThirdKeys[k];

        mgrsStream.write(
          `${k === 0 ? "" : ","}"${levelThree}":${JSON.stringify(
            mgrsData[levelOne][levelTwo][levelThree]
          )}`
        );
      }
      mgrsStream.write(`}`);
    }
    mgrsStream.write(`}`);
  }
  mgrsStream.write(`}`);
  mgrsStream.end();

  streetNamesStream.end();
  streetIndexStream.end();
  streetDataStream.end();

  client.end();

  console.log("\n\ndone.");
}

writeOut();
