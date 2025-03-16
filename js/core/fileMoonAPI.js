const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const { bytesToMB, formatBytes } = require("./utils");
const cliprogress = require("cli-progress");

class FileMoonAPI {
  constructor(API_KEY) {
    this.__API = API_KEY;
    this._Session = axios.create();
    this._VirtualDir = {};
    this._ServerLinkMap = {
      link: "<average speed in mbps>",
    };
    this.__BAR = new cliprogress.SingleBar({
      format:
        "Progress |{bar}| {percentage}% || {value_f}/{total_f} Items || {eta_formatted}>{duration_formatted} || Speed: {speed}",
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: true,
    });
  }

  async connect(api_key) {
    try {
      const response = await this._Session.get(
        `https://filemoonapi.com/api/account/info?key=${api_key}`
      );
      if (response.data.status === 200) {
        this.__API = api_key;
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error connecting to FileMoon API:", error);
      return false;
    }
  }

  async get_directory(dirId = null) {
    try {
      const url = `https://filemoonapi.com/api/folder/list?key=${this.__API}${
        dirId ? `&fld_id=${dirId}` : ""
      }`;
      const response = await this._Session.get(url);
      await new Promise((resolve) => setTimeout(resolve, 200)); // Simulate delay
      return response.data;
    } catch (error) {
      console.error("Error getting directory:", error);
      return null;
    }
  }

  async get_virtualDir(id = null) {
    const VIRT_DIR = {};
    const dirList = await this.get_directory(id);
    if (dirList && dirList.result && dirList.result.folders) {
      for (const folder of dirList.result.folders) {
        const folderName = `${folder.name} - ID: ${folder.fld_id}`;
        VIRT_DIR[folderName] = {};
        VIRT_DIR[folderName] = await this.get_virtualDir(folder.fld_id);
      }
    }
    return VIRT_DIR;
  }

  async create_directory(name, parent_id) {
    try {
      const url = `https://filemoonapi.com/api/folder/create?key=${this.__API}&name=${name}&parent_id=${parent_id}`;
      const response = await this._Session.get(url);
      return response.data;
    } catch (error) {
      console.error("Error creating directory:", error);
      return null;
    }
  }

  async get_upload_server() {
    try {
      const response = await this._Session.get(
        `https://filemoonapi.com/api/upload/server?key=${this.__API}`
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

  async upload_file(file, fld_id) {
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
  }
}

module.exports = FileMoonAPI;
