const { QuickDB } = require("quick.db");
const path = require("path");
const config = require("../config/env");
const fs = require("fs");
const filemoonService = require("../services/filemoonService");
const playListService = require("../services/playListService");
const PlaylistModel = require("../models/playlistModel");
const FileModel = require("../models/fileModel");

/**
 * @type {PlaylistModel[]}
 */
const playListList = [];

const run = async () => {
  console.log("Upload Hosted service started");

  setInterval(async () => {
    await task();
  }, 1 * 60 * 1000);
};

async function task() {
  console.log("Upload Hosted service running");
  let plList = await playListService.getAllPlaylist();
  // update local playlist dataset
  for (let pl of plList) {
    if (playListList.findIndex((x) => x.uuid == pl.uuid) == -1) {
      if (!(pl instanceof PlaylistModel)) {
        pl = Object.assign(new PlaylistModel(), pl);
      }
      playListList.push(pl);
    }
  }

  for (let pl of playListList) {
    let res = uploadNextFile(pl);
  }
}

/**
 *
 * @param {FileModel} file
 * @param {PlaylistModel} pl
 */
async function uploadCallback(file, pl) {
  if (file.uploadRequest.status == 200 || file.uploadRequest.status == 502) {
    pl.moveFileToUploaded(file);
    await playListService.updatePlaylist(pl);
    if(pl.deleteAfter) {
      fs.unlinkSync(file.getFilePath())
    }
  }
  console.log("Upload callback", file.uploadRequest.status);
  uploadNextFile(pl);
}

/**
 *
 * @param {PlaylistModel} pl
 */
function uploadNextFile(pl) {
  if (pl.pendingUpload.length == 0) {
    return -1;
  }
  let file = pl.getNextFileToUpload();
  if (!file) {
    return -1;
  }
  
  if(!/.mp4|.mkv|.wav/.test(file.maskedPath)) { 
    pl.removeFile(file);
    playListService.updatePlaylist(pl);
    return -1;
  }
  if (file.uploadRequest == null) {
    file.uploadRequest = "pending";
    filemoonService.uploadFile(file, pl, uploadCallback);
  }
}

module.exports = {
  run,
};
