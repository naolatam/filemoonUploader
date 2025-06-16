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
  task();
  setInterval(async () => {
    await task();
  }, 1 * 15 * 1000);
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
    uploadNextFile(pl);
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
    if (pl.deleteAfter) {
      fs.unlinkSync(file.getFilePath());
    }
  }
  uploadNextFile(pl);
}

/**
 *
 * @param {PlaylistModel} pl
 */
async function uploadNextFile(pl) {
  if (pl.pendingUpload.length == 0) {
    for (f of pl.playlist) {
      if (!/.mp4|.mkv|.wav/.test(f.maskedPath)) {
        let stat = fs.statfsSync(config.video_path + f.maskedPath)
        if (stat) {
          if(stat.isDirectory()) {
            fs.rmSync(config.video_path + f.maskedPath, { recursive: true });
          }else {
            fs.unlinkSync(config.video_path + f.maskedPath);
          }
        }                

        pl.removeFile(f);
        playListService.updatePlaylist(pl);
      }
    }
    return -1;
  }
  let file = pl.getNextFileToUpload();
  if (!file) {
    return -1;
  }

  if (!/.mp4|.mkv|.wav/.test(file.maskedPath)) {
    pl.moveFileToUploaded(file);
    playListService.updatePlaylist(pl);
    uploadNextFile(pl);
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
