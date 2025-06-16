/**
@param {Request} req
@param {Response} res
*/

const filemoonService = require("../services/filemoonService");
const fs = require("fs").promises;
const path = require("path");
const config = require("../config/env");

const playlistService = require("../services/playListService");
const PlaylistModel = require("../models/playlistModel");
const FileModel = require("../models/fileModel");

/**
 * @param {Request} req
 * @param {Response} res
 */
exports.renderPlaylist = async (req, res) => {
  res.render("playlist");
}


exports.getAllPlaylist = async (req, res) => {
    let all = await playlistService.getAllPlaylist();
  res.json(all);
};

exports.getPlaylist = async (req, res) => {
  if (!req.query.name) {
    res.json({ status: 401, error: "INV_REQ", message: "Name is required!" });
  }
  res.json(await playlistService.getPlaylistByName(req.query.name));
};

/**
 * @param {Request} req
 * @param {Response} res
 */


/**
 * @param {Request} req
 * @param {Response} res
 */
exports.newPlaylist = async (req, res) => {
  let b = req.body;
  if (
    !b.name ||
    !b.localFiles ||
    !b.remoteFolders ||
    b.remoteFolders.length === 0
  ) {
    res
      .status(400)
      .json({ error: "name, localFiles and remoteFolders are required" });
    return;
  }
  let name = b.name;
  let localFiles = b.localFiles;
  let fldId = b.remoteFolders[0];
  if (!name || !fldId) {
    res.status(400).json({ error: "name and fldId are required" });
    return;
  }
  if(name.includes("#")) {
    res.status(400).json({ error: "name cannot contain # character" });
    return;
  }
  
  if ((await playlistService.getPlaylistByName(name)).length > 0)
    name += " #" + (await playlistService.getPlaylistByName(name)).length;
  let p = new PlaylistModel(name, b.order, b.deleteAfterSend, fldId);

  for (let file of localFiles) {
    let f = new FileModel(config.video_path +file);
    p.addFile(f);
  }
  playlistService.addPlaylist(p);
  res.json(p);
};

exports.clearPlaylist = async (req, res) => {
  playlistService.clearPlaylist();
  res.json({ status: 200, message: "Playlist cleared" });
};
