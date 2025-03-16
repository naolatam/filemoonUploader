const { QuickDB } = require("quick.db");
const path = require("path")
const config = require("../config/env")
const {generateRandomToken, checkToken} = require("../services/tokensService");
const { getState } = require("../services/statistiqueService");

const dbFilePath = path.join(__dirname, "../", config.db_path);
const db = new QuickDB({ filePath: dbFilePath });

/**  
@param {Request} req
@param {Response} res
@param {Function} next
*/

module.exports = async (req, res, next) => {
  return next()
  if((await getState()) != "Ready!") {
    return res.render("loading")
  } 
  next()
};
