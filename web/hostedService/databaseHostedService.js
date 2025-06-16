const { QuickDB } = require("quick.db");
const path = require("path");
const config = require("../config/env");
const fileMoonService = require("../services/filemoonService");
const fs = require("fs");
const filemoonService = require("../services/filemoonService");

const dbFilePath = path.join(__dirname, "../", config.db_path);
const db = new QuickDB({ filePath: dbFilePath });

const run = async () => {
  console.log("Database Hosted service started");
  await db.set("state", "prepare...")
  await task();
  await db.set("state", "Ready!")
  setInterval(async () => {
    await task();
  }, 15 * 60 * 1000);
};

async function task() {
  await db.set("loading", true);

  console.log("Database Hosted service running");

  // Do something every 15 minutes
  if(!await db.get("playlist")) {
    await db.set("playlist", []);
  }
  await db.set("status", "fetching virtual dir");
  let virtDir = await fileMoonService.fetchVirtualDir();
  await db.set("virtualDir", virtDir);
  await db.set("status", "Counting file");
  await db.set("filesCount", await countFiles(config.video_path));

  await db.set("status", "Ready");
  await db.set("loading", false);


}

async function countFiles(dir) {
    let count = 0;
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
        if (file.isDirectory()) {
            count += await countFiles(path.join(dir, file.name));
        } else {
            count++;
        }
    }

    return count;
}

module.exports = {
  run,
};
