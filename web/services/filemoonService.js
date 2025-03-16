const { QuickDB } = require("quick.db");
const path = require("path");
const config = require("../config/env");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const FileModel = require("../models/fileModel");
const PlaylistModel = require("../models/playlistModel");

const dbFilePath = path.join(__dirname, "../", config.db_path);
const db = new QuickDB({ filePath: dbFilePath });

async function get_directory(dirId = null) {
  try {
    const url = `https://filemoonapi.com/api/folder/list?key=${
      config.filemoon_API
    }${dirId ? `&fld_id=${dirId}` : ""}`;
    const response = await axios.get(url);
    await new Promise((resolve) => setTimeout(resolve, 200)); // Simulate delay
    return response.data;
  } catch (error) {
    console.error("Error getting directory:", error);
    return null;
  }
}
async function fetch_virtualDir(id = null) {
  let VIRT_DIR = {};
  const dirList = await get_directory(id);
  if (dirList && dirList.result && dirList.result.folders) {
    for (const folder of dirList.result.folders) {
      const folderName = `${folder.name} - ID: ${folder.fld_id}`;
      VIRT_DIR[folderName] = {};
      VIRT_DIR[folderName] = await fetch_virtualDir(folder.fld_id);
    }
  }
  return VIRT_DIR;
}

async function create_directory(name, parent_id) {
  try {
    const url = `https://filemoonapi.com/api/folder/create?key=${config.filemoon_API}&name=${name}&parent_id=${parent_id}`;
    const response = await axios.get(url);
    let data = response.data;
    if (data.status == 200) {
      let VIRT_DIR = await db.get("virtualDir");
      const parentDir = Object.keys(VIRT_DIR).find((key) =>
        key.includes(`ID: ${parent_id}`)
      );
      if (parentDir) {
        VIRT_DIR[parentDir][`${name} - ID: ${data.result.fld_id}`] = {};
        await db.set("virtualDir", VIRT_DIR);
      }
      return data;
    } else {
      return data;
    }
  } catch (error) {
    console.error("Error creating directory:", error);
    return null;
  }
}

async function get_upload_server() {
  try {
    const response = await axios.get(
      `https://filemoonapi.com/api/upload/server?key=${config.filemoon_API}`
    );
    if (response.data.status === 200) {
      return response.data.result;
    }
    return null;
  } catch (error) {
    console.error("Error getting upload server:", error);
    return null;
  }
}
/**
 *
 * @param {FileModel} file
 * @param {PlaylistModel} pl
 * @param {Function} callback
 */
async function upload_file(file, pl, callback) {
  let serverUrl = await get_upload_server();
  if (!serverUrl) {
    return { status: 500, message: "Could not get upload server" };
  }

  const form = new FormData();
  form.append("key", config.filemoon_API);
  form.append("fld_id", pl.fldId);
  form.append("file", file.getStream(), { filepath: file.getFilePath() });

  let res = await axios
    .post(serverUrl, form, {
      Headers: { ...form.getHeaders() },
      maxRedirects: 0,
    })
    .catch((err) => err);
  if (res.status == 200 || res.status == 502) {
    file.uploadRequest = {status: res.status, data: res.data};
    return callback(file, pl);
  }
  file.uploadRequest = null;
  return { status: 400, message: "Error uploading file" };
}

async function getVirtualDir() {
  return await db.get("virtualDir");
}

module.exports = {
  getDirectory: get_directory,
  fetchVirtualDir: fetch_virtualDir,
  getVirtualDir: getVirtualDir,
  createDirectory: create_directory,
  getUploadServer: get_upload_server,
  uploadFile: upload_file,
};

/* async upload_file(file, fld_id) {
  try {
    let fileName = file
      .split("/")
      .pop()
      .replace("'", "_")
      .replace("  ", " ")
      .split("(")[0]
      .split(")")[0]
      .trim();

    let fileExist = await this.get_file_by_name(fileName);
    if (fileExist.status === 200 && fileExist.result.results !== 0) {
      return { status: 400, message: "File already exists" };
    }

    let serverUrl = await this.get_upload_server();
    if (!serverUrl) {
      return { status: 500, message: "Could not get upload server" };
    }

    while (
      this._ServerLinkMap[serverUrl] &&
      this._ServerLinkMap[serverUrl] <= 3
    ) {
      if (Object.values(this._ServerLinkMap).every((value) => value < 3)) {
        break;
      }
      serverUrl = await this.get_upload_server();
    }

    file = file.replace("\r", "");
    file = file.replace("\\r", "");

    let stream = fs.createReadStream(file);
    const form = new FormData();
    form.append("key", this.__API);
    form.append("fld_id", fld_id);
    form.append("file", stream, { filepath: file });

    let total_f = formatBytes(fs.statSync(file).size);

    this.__BAR.start(fs.statSync(file).size, 0, {
      speed: "N/A",
      value_f: "0",
      total_f: total_f,
    });
    let lastBytes = 0;
    let count = 0;
    let speedTotal = 0;
    let interval = setInterval(async () => {
      let speed = (stream.bytesRead - lastBytes) * 2;
      lastBytes = stream.bytesRead;
      if (bytesToMB(speedTotal / (count / 2)) < 1) {
        stream.close();
        clearInterval(interval);
        this.__BAR.stop();
        await this.upload_file(file, fld_id);
        return;
      }

      this.__BAR.update(stream.bytesRead, {
        value_f: formatBytes(lastBytes),
        speed: formatBytes(speed) + "/s",
        total_f: total_f,
      });

      speedTotal += speed;
      count++;
    }, 500);

    let response = await axios.post(serverUrl, form, {
      headers: {
        ...form.getHeaders(),
      },
      maxRedirects: 0,
    });
    clearInterval(interval);
    this._ServerLinkMap[serverUrl] = bytesToMB(speedTotal / count).toFixed(2);
    this.__BAR.stop();
    return response.data;
  } catch (error) {
    console.error("Error uploading file:");
    console.error(error);
    return { status: 402, message: "Error uploading file" };
  }
}

async get_file_by_id(file_code) {
  try {
    const url = `https://filemoonapi.com/api/file/info?key=${this.__API}&file_code=${file_code}`;
    const response = await this._Session.get(url);
    return response.data;
  } catch (error) {
    console.error("Error getting file by ID:", error);
    return { status: 400, message: "File not found" };
  }
}

async get_file_by_name(file_name) {
  try {
    let title = file_name.split(".").slice(0, -1).join(" ");
    if (title == "") title = file_name;

    let url = `https://filemoonapi.com/api/file/list?key=${
      this.__API
    }&title=${encodeURI(title)}`;
    let response = await this._Session.get(url);
    return response.data;
  } catch (error) {
    console.error("Error getting file by name:", error);
    return { status: 400, message: "File not found" };
  }
} */
