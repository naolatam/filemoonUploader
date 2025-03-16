const { QuickDB } = require("quick.db");
const path = require("path");
const config = require("../config/env");

const dbFilePath = path.join(__dirname, "../", config.db_path);
const db = new QuickDB({ filePath: dbFilePath });

const PlaylistModel = require("../models/playlistModel");

/**
 *
 * @returns {PlaylistModel[]}
 */
async function getAllPlaylist() {
  return (await db.get("playlist"));
}
/**
 *
 * @returns {PlaylistModel[]}
 */
async function getPlaylistByName(name) {
  return (await getAllPlaylist()).filter((p) => p.name.split(" #")[0] == name);
}
async function getPlaylistByUUID(uuid) {
  return (await getAllPlaylist()).filter((p) => p.uuid == uuid);
}


/**
 *
 * @param {PlaylistModel} pl
 */
async function addPlaylist(pl) {
  await db.push("playlist", pl);
}

/**
 * @param {PlaylistModel} pl
 */
async function updatePlaylist(pl) {
  let plList = await getAllPlaylist();
  let index = plList.findIndex((p) => p.uuid == pl.uuid);
  if (index == -1) {
    return;
  }
  plList[index] = pl;
  await db.set("playlist", plList);
}

async function clearPlaylist() {
  await db.set("playlist", []);
}

module.exports = {
  getAllPlaylist,
  getPlaylistByUUID,
  getPlaylistByName,
  addPlaylist,
  updatePlaylist,
    clearPlaylist
};
