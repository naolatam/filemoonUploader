/**
@param {Request} req
@param {Response} res
*/

const filemoonService = require("../services/filemoonService");
const fs = require('fs').promises;
const path = require('path');
const config = require('../config/env');

exports.uploadPage = async (req, res) => {
    res.render("upload", {
        getFileMoonVirtualDir: await filemoonService.getVirtualDir(),
        createFolder: filemoonService.createFolder
        });
}


/**
 * @param {Request} req
 * @param {Response} res
 */
exports.localFiles = async (req, res) => {
    async function getFileTree(dir) {
        const files = await fs.readdir(dir, { withFileTypes: true });
        const fileTree = await Promise.all(files.map(async (file) => {
            const filePath = path.join(dir, file.name);
            let customPath = filePath.replace(config.video_path.replace("./", ''), '');
            if(customPath.startsWith('/')) customPath = customPath.slice(1);
            if (file.isDirectory()) {
                return {
                    name: file.name,
                    type: 'folder',
                    path: customPath,
                    children: await getFileTree(filePath)
                };
            } else {
                return {
                    name: file.name,
                    path: customPath,
                    type: 'file'
                };
            }
        }));
        return fileTree;
    }


    const fileTree = await getFileTree(config.video_path);
    res.json(fileTree);
}

exports.remoteFolders = async (req, res) => {
    res.json(await filemoonService.getVirtualDir());
}



/**
 * @param {Request} req
 * @param {Response} res
 */
exports.newRemoteFolder = async (req, res) => {
    let query = req.query;
    let name = query.name
    let fldId = query.fldId
    if(!name || !fldId) {
        res.status(400).json({error: "name and fldId are required"});
        return;
    }
    let response = await filemoonService.createDirectory(name, fldId);
    res.json(response);
}

