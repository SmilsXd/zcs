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
        unlinkSync(process.cwd() + "/output/compressed/mgrs.txt.gz");
        unlinkSync(process.cwd() + "/output/compressed/street-data.txt.gz");
        unlinkSync(process.cwd() + "/output/compressed/street-names.txt.gz");
        unlinkSync(process.cwd() + "/output/compressed/streets-index.txt.gz");
    } catch {
        //
    }

    // MGRS
    await compress(
        process.cwd() + "/output/mgrs.txt",
        process.cwd() + "/output/compressed/mgrs.txt.gz"
    );

    // Street data
    await compress(
        process.cwd() + "/output/street-data.txt",
        process.cwd() + "/output/compressed/street-data.txt.gz"
    );

    // Street names
    await compress(
        process.cwd() + "/output/street-names.txt",
        process.cwd() + "/output/compressed/street-names.txt.gz"
    );

    // Streets Index
    await compress(
        process.cwd() + "/output/streets-index.txt",
        process.cwd() + "/output/compressed/streets-index.txt.gz"
    );
}

compressThemAll()