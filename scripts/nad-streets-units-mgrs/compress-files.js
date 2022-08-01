const { createGzip } = require("zlib");
const { createReadStream, createWriteStream, unlinkSync } = require("fs");
const { pipeline } = require("stream");
const { promisify } = require("util");

const pipe = promisify(pipeline);

async function compress(input, output) {
  const compress = createGzip();
  const source = createReadStream(input);
  const destination = createWriteStream(output);

  await pipe(source, compress, destination);
}

async function compressThemAll() {
  // remove old compressed files
  try {
    unlinkSync(process.cwd() + "/output/compressed/mgrs.js.gz");
    unlinkSync(process.cwd() + "/output/compressed/street-data.json.gz");
    unlinkSync(process.cwd() + "/output/compressed/street-names.js.gz");
    unlinkSync(process.cwd() + "/output/compressed/streets-index.js.gz");
  } catch {
    //
  }

  // MGRS
  await compress(
    process.cwd() + "/output/mgrs.js",
    process.cwd() + "/output/compressed/mgrs.js.gz"
  );

  // Street data
  await compress(
    process.cwd() + "/output/street-data.json",
    process.cwd() + "/output/compressed/street-data.json.gz"
  );

  // Street names
  await compress(
    process.cwd() + "/output/street-names.js",
    process.cwd() + "/output/compressed/street-names.js.gz"
  );

  // Streets Index
  await compress(
    process.cwd() + "/output/streets-index.js",
    process.cwd() + "/output/compressed/streets-index.js.gz"
  );
}

compressThemAll();
