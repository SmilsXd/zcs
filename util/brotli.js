const { createBrotliDecompress } = require("zlib");
const { createReadStream, createWriteStream, unlinkSync } = require("fs");
const { pipeline } = require("stream");
const { promisify } = require("util");

const pipe = promisify(pipeline);

async function decompress(input, output) {
  const compress = createBrotliDecompress();
  const source = createReadStream(input);
  const destination = createWriteStream(output);

  await pipe(source, compress, destination);
}

async function decompressStreetData() {
    decompress(process.cwd() + "/data/street-data.js.br", process.cwd() + "/data/street-data.js")
}

decompressStreetData();
