const config = require("../config/env");
const FileModel = require("./fileModel");
const { randomUUID } = require("crypto");

class PlaylistModel {
  constructor(
    name = "Playlist #default",
    order = "none",
    deleteAfter = false,
    fldId = 0
  ) {
    this.playlist = [];
    this.pendingUpload = [];
    this.uploaded = [];
    this.order = order;
    this.deleteAfter = deleteAfter;
    this.name = name;
    this.fldId = fldId;
    this.uuid = randomUUID();
  }

  #sortPlaylist() {
    if (this.order == "asc") {
      this.pendingUpload = this.pendingUpload.sort();
    } else if (this.order == "desc") {
      this.pendingUpload = this.pendingUpload.sort().reverse();
    }
  }

  addFile(file) {
    this.playlist.push(file);
    this.pendingUpload.push(file);
    this.#sortPlaylist();
  }

  removeFile(file) {
    this.playlist = this.playlist.filter((s) => !file.equals(s));
    this.pendingUpload = this.pendingUpload.filter((s) => !file.equals(s));
    this.#sortPlaylist();
  }

  moveFileToUploaded(file) {
    this.pendingUpload = this.pendingUpload.filter((s) => !file.equals(s));
    this.uploaded.push(file);
  }

  getPlaylist() {
    return this.playlist;
  }

  /**
   *
   * @returns {FileModel}
   */
  getNextFileToUpload() {
    let f = this.pendingUpload[0];
    if (!f) {
      return null;
    }
    f = FileModel.parseFile(f);
    this.pendingUpload[0] = f
    return f;
  }
}

module.exports = PlaylistModel;
