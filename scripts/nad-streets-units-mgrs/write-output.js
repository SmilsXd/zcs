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
    `\rProcessed ${stats.records} records. Unique names: ${stats.uniqueNames
    } Elapsed: ${elapsedTime()}. Heap used: ${Math.round(heapUsed * 100) / 100
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

  // open write streams
  const streetNamesStream = fs.createWriteStream(
    process.cwd() + "/output/street-names.js"
  );

  const streetIndexStream = fs.createWriteStream(
    process.cwd() + "/output/streets-index.js"
  );

  const streetDataStream = fs.createWriteStream(
    process.cwd() + "/output/street-data.js"
  );

  streetNamesStream.write(`module.exports = [\n`);
  streetIndexStream.write(`module.exports = {\n`);
  streetDataStream.write(`module.exports = [\n`);

  const query = new QueryStream("select * from data order by name");
  client.query(query);

  let count = 0;
  let index = 0;

  let streetName = "";
  let streetData = {};
  let mgrsData = {};

  for await (const street of query) {
    if (count === 0) streetName = street.name;

    if (street.name !== streetName) {
      streetDataStream.write(
        `${index === 0 ? "" : "},\n"}{`
      );

      let i;
      let j;
      const streetNumKeys = Object.keys(streetData);

      for (i = 0; i < streetNumKeys.length; i++) {
        const zipIndexKeys = Object.keys(streetData[streetNumKeys[i]]);

        for (j = 0; j < zipIndexKeys.length; j++) {
          const zipIndex = zipIndexKeys[j]
          let isFirst = false

          if (!isFirst) {
            streetDataStream.write(`${i === 0 ? "" : ","}"${streetNumKeys[i]}":{`);
          }

          if (streetData[streetNumKeys[i]][zipIndex] && streetData[streetNumKeys[i]][zipIndex].length > 0) {
            // write out units
            streetDataStream.write(`"${zipIndex}":${JSON.stringify(streetData[streetNumKeys[i]][zipIndex])}`);
          } else {
            // write out zip index only
            streetDataStream.write(
              `"${zipIndex}"`
            );
          }

          if (j === zipIndexKeys.length - 1) {
            streetDataStream.write(`}`);
          }

          isFirst = true
        }
      }

      // Write unique street names to file
      streetNamesStream.write(`${index === 0 ? "" : ",\n"}"${streetName}"`);

      // write street indexes to file
      streetIndexStream.write(
        `${index === 0 ? "" : ",\n"}"${streetName}":${Number.parseInt(index)}`
      );

      index++;
      streetName = street.name;
      streetData = {};
    }

    if (!streetData[street.number]) {
      streetData[street.number] = { [street.zip_index]: [] };
    }

    if (!streetData[street.number][street.zip_index]) {
      streetData[street.number][street.zip_index] = [];
    }

    // Add units
    if (street.unit) {
      // split unit type from unit number
      const split = street.unit.split(" ");
      let type = "";
      let num = "";

      if (split.length > 1) {
        for (let k = 0; k < split.length; k++) {
          if (k === split.length - 1) {
            num = split[k];
          } else {
            type += `${k === 0 ? '' : ' '}${split[k]}`;
          }
        }
      }

      // Add 2D array of units
      let addedToTypeArr = false;

      for (
        let k = 0;
        k < streetData[street.number][street.zip_index].length;
        k++
      ) {
        const checkType = streetData[street.number][street.zip_index][k][0];

        if (
          checkType &&
          checkType === type &&
          streetData[street.number][street.zip_index][k][1].indexOf(num) < 0
        ) {
          streetData[street.number][street.zip_index][k][1].push(num);
          addedToTypeArr = true;
          break;
        }
      }

      if (!addedToTypeArr) {
        streetData[street.number][street.zip_index].push([type, []]);

        streetData[street.number][street.zip_index][
          streetData[street.number][street.zip_index].length - 1
        ][1].push(num);
      }

      //////////
      // MGRS DATA
      // Split into 4 parts
      let mgrsParts = ["", "", "", ""];

      let j;
      for (j = 0; j < street.mgrs.length; j++) {
        if (j < 3) {
          mgrsParts[0] += street.mgrs[j];
        } else if (j >= 3 && j < 5) {
          mgrsParts[1] += street.mgrs[j];
        } else if (j >= 5 && j < 10) {
          mgrsParts[2] += street.mgrs[j];
        } else if (j >= 10 && j < 15) {
          mgrsParts[3] += street.mgrs[j];
        }
      }

      if (!mgrsData[mgrsParts[0]]) {
        mgrsData[mgrsParts[0]] = {};
      }

      if (!mgrsData[mgrsParts[0]][mgrsParts[1]]) {
        mgrsData[mgrsParts[0]][mgrsParts[1]] = {};
      }

      if (!mgrsData[mgrsParts[0]][mgrsParts[1]][mgrsParts[2]]) {
        mgrsData[mgrsParts[0]][mgrsParts[1]][mgrsParts[2]] = {};
      }

      if (!mgrsData[mgrsParts[0]][mgrsParts[1]][mgrsParts[2]][mgrsParts[3]]) {
        mgrsData[mgrsParts[0]][mgrsParts[1]][mgrsParts[2]][mgrsParts[3]] = [
          index,
        ];
      } else {
        // Only push unique indices
        if (
          mgrsData[mgrsParts[0]][mgrsParts[1]][mgrsParts[2]][
            mgrsParts[3]
          ].indexOf(index) < 0
        ) {
          mgrsData[mgrsParts[0]][mgrsParts[1]][mgrsParts[2]][mgrsParts[3]].push(
            index
          );
        }
      }
    }

    count++;

    // Display current stats
    if (count % LOG_INTERVAL === 0) {
      stats.records = count;
      stats.uniqueNames = index + 1;
      displayStats();
    }
  }

  // Write street data to file one last time
  // TODO replace stringify with raw text output
  streetDataStream.write(`${JSON.stringify(streetData)}\n`);

  // Write unique street names to file
  streetNamesStream.write(`${index === 0 ? "" : ","}"${streetName}"`);

  // write street indexes to file
  streetIndexStream.write(
    `${index === 0 ? "" : ","}"${streetName}":${Number.parseInt(index)}`
  );

  streetNamesStream.write(`\n]`);
  streetIndexStream.write(`\n}`);
  streetDataStream.write(`\n]`);

  const mgrsStream = fs.createWriteStream(process.cwd() + "/output/mgrs.js");
  // May need to stream this somehow
  mgrsStream.write(JSON.stringify(mgrsData));
  mgrsStream.end();

  streetNamesStream.end();
  streetIndexStream.end();
  streetDataStream.end();

  client.end();

  console.log("\n\ndone.");
}

writeOut();
