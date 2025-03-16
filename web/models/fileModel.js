const fs = require("fs");
const config = require("../config/env");
const { randomUUID } = require("crypto");
class FileModel {
  #stream;
  #filePath;
  constructor(filePath) {
    
    this.#filePath = filePath;
    this.maskedPath = filePath.replace(config.video_path, "");
    this.#stream = fs.createReadStream(this.#filePath);
    this.deleteAfter = false;
    this.uploadRequest = null;
    this.uuid = randomUUID() 
  }

  setUploadRequest(uploadRequest) {
    this.uploadRequest = uploadRequest;
  }

  getStream() {
    return this.#stream;
  }
  getUploaded() {
    return this.#stream.bytesRead;
  }
  getFilePath() {
    return this.#filePath;
  }
  /**
   * 
   * @param {FileModel} file 
   * @returns {boolean}
   */
  equals(file) {
    return (
      this.uuid == file.uuid
    );
  }

  static parseFile(file) {
    if(!file.maskedPath) return null;
    if(!(file instanceof FileModel)) {
      file = Object.assign(new FileModel(config.video_path + file.maskedPath), file);
    }
    return file;
  }
}

module.exports = FileModel;
