const { QuickDB } = require("quick.db");
const path = require("path");
const config = require("../config/env");

const dbFilePath = path.join(__dirname, "../", config.db_path);
const db = new QuickDB({ filePath: dbFilePath });

/**
 * @return {String}
 */
async function generateRandomToken(loginLog = false) {
  let randomToken =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  await db.push("tokens", randomToken);
  console.log(`🔑 Token admin created : ${randomToken}`);
  if (loginLog) {
    console.log(
      "🔑 Token admin login link: " + config.url + "/?token=" + randomToken
    );
  }
  return randomToken;
}

exports.generateRandomToken = generateRandomToken;

async function checkToken(token) {
  let tokens = await db.get("tokens"); 
  return tokens.includes(token);
}

exports.checkToken = checkToken;