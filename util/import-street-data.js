const fs = require("fs");
const readline = require("readline");

async function importData() {
  return await new Promise((resolve) => {
    const data = [];

    const fileStream = fs.createReadStream(process.cwd() + '/data/street-data.js');
    const rl = readline.createInterface({
      input: fileStream,
    });


    rl.on("line", (line) => {
      console.log(line);
      if (line !== "[" && line !== "]") {
        line = line.slice(0, line.length - 1);
        console.log("mod: " + line);
        data.push(JSON.parse(line));
      }
    });

    rl.on("close", () => {
      console.log(`\ndone.\n`);

      resolve(data);
    });
  });
}

module.exports = importData;
