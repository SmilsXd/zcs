const fs = require("fs");
const readline = require("readline");

async function loadData(index) {
  return await new Promise(async (resolve) => {
    const data = [];

    const fileStream = fs.createReadStream(process.cwd() + '/data/street-data.js');
    const rl = readline.createInterface({
      input: fileStream,
    });
    
    rl.on("line", (line) => {
      if (line !== "module.exports = [" && line !== "[" && line !== "]") {
        line = line.slice(0, line.length - 1);
        data.push(JSON.parse(line));
      }
    });

    rl.on("close", () => {
      console.log(`\ndone.\n`);

      resolve(data);
    });
  });
}

module.exports = loadData