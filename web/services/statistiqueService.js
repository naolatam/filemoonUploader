const { QuickDB } = require("quick.db");
const path = require("path");
const config = require("../config/env");

const dbFilePath = path.join(__dirname, "../", config.db_path);
const db = new QuickDB({ filePath: dbFilePath });

async function getStatistiques() {
  let res = {
    files: 0,
    currentPlaylist: 0,
    uploadedFile: 0,
    fileOnFilemoon: 0,
  };
  res.currentPlaylist = (await db.get("currentPlaylist"))?.length || 0;
  res.files = (await db.get("filesCount")) || 0;
  res.uploadedFile = (await db.get("uploadedFile")) || 0;
  res.fileOnFilemoon = null || 0; // filemoon API is not yet implemented
  return res;
}
async function getLoading() {
  return await db.get("loading");
}
async function getStatus() {
  return await db.get("status");
}
async function getState() {
  return await db.get("state");
}
exports.getStatistiques = getStatistiques;
exports.getLoading = getLoading;
exports.getState = getState
exports.getStatus = getStatus
