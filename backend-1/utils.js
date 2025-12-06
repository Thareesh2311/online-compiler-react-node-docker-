const fs = require("fs");
const path = require("path");

function makeTempDir() {
  return new Promise((resolve, reject) => {
    const base = path.join(__dirname, "tmp");

    if (!fs.existsSync(base)) {
      fs.mkdirSync(base);
    }

    const dir = path.join(base, "work_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5));

    fs.mkdir(dir, (err) => {
      if (err) return reject(err);
      resolve({ dir });
    });
  });
}

module.exports = { makeTempDir };
