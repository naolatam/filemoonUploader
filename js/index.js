const path = require('path');
const FileMoonAPI = require('./core/fileMoonAPI'); // Adjust path as needed
const navigateDirectory = require('./core/dirNavigation'); // Adjust path as needed
const file_dialog = require("node-file-dialog");
const { createReadStream } = require('fs');
require('dotenv').config();

const log = console;

/**
 * Choose video files to upload.
 * Opens a file dialog for selecting video files.
 * @returns {Promise<string[]>} List of selected video file paths.
 */
async function chooseVideoToUpload() {
    const options = {
        title: "Select Video Files",
        buttonLabel: "Upload",
        filters: [
            { name: "Videos", extensions: ["mp4", "avi", "mkv", "mov"] }
        ],
        type: "open-files",
        properties: ["openFile", "multiSelections"]
    };
    let files = await file_dialog(options)
    files = files.sort();
    const filePaths = files.map(file => file.replace("\r", ""));
    log.info(`Selected ${filePaths.length} files:` + filePaths.map(file => `\n- ${file.split("/").pop()}`).join(''));
    return filePaths;
}

/**
 * Choose a remote directory using the FileMoon API.
 * Handles directory navigation and creation.
 * @param {FileMoonAPI} fileMoonManager Instance of FileMoonAPI.
 * @returns {Promise<string>} Selected directory ID.
 */
async function chooseRemoteDirectory(fileMoonManager) {
    log.info("Fetching virtual directory...");
    if (Object.keys(fileMoonManager._VirtualDir).length === 0) {
        fileMoonManager._VirtualDir = await fileMoonManager.get_virtualDir();
    }
    log.info("Virtual directory fetched");

    while (true) {
        const navigationReturn = await navigateDirectory(fileMoonManager._VirtualDir);

        switch (navigationReturn.action) {
            case "select":
                log.info(`Selected directory: ${navigationReturn.path.join('/')}`);
                return navigationReturn.fldId;

            case "create":
                const res = await fileMoonManager.create_directory(navigationReturn.name, navigationReturn.fldId);
                if (res.status === 200) {
                    log.info(`Directory '${navigationReturn.name}' created successfully`);
                    let pos = fileMoonManager._VirtualDir;
                    for (const i of navigationReturn.full_path) {
                        pos = pos[i];
                    }
                    pos[`${navigationReturn.name} - ID: ${res.result.fld_id}`] = {};
                } else {
                    log.error(`Error creating directory: ${res}`);
                }
                break;

            case "error":
                log.error("An error occurred");
                break;

            default:
                log.error("Unexpected error");
        }
    }
}

/**
 * Main function to execute the script.
 */
async function main() {
    log.info("Initializing FileMoonAPI...");
    const fileMoonManager = new FileMoonAPI(process.env.API_KEY);
    const connected = await fileMoonManager.connect(process.env.API_KEY);
    if (!connected) {
        log.error("Connection failed");
        return;
    }

    log.info("Connection successful");

    const fld_id = await chooseRemoteDirectory(fileMoonManager);
    if (!fld_id) return;

    const videoFiles = await chooseVideoToUpload();
    if (!videoFiles) return;


    for (const video of videoFiles) {
        const fileName = path.basename(video);
        log.info(`Uploading ${fileName}...`);
        const res = await fileMoonManager.upload_file(video, fld_id);

        if (res.status === 200) {
            log.info(`File '${fileName}' uploaded successfully`);
        } else if (res.status === 400) {
            log.error(`File already uploaded: ${res.message}`);
        } else {
            log.error(`Error uploading file: ${res}`);
        }
    }

    log.info("All files uploaded successfully");
}

main();
