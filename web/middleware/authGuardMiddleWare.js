const { QuickDB } = require("quick.db");
const path = require("path")
const config = require("../config/env")
const {generateRandomToken, checkToken} = require("../services/tokensService")

const dbFilePath = path.join(__dirname, "../", config.db_path);
const db = new QuickDB({ filePath: dbFilePath });

/**  
@param {Request} req
@param {Response} res
@param {Function} next
*/

module.exports = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    const urlToken = req.query.token;
    if (await checkToken(urlToken)) {
        res.cookie('token', urlToken, { maxAge: 1000*60*60*24, expire: 0, httpOnly: true });
        return res.redirect(req.url.split("?")[0]);
    }    
    generateRandomToken(true);
    return res.status(401).json({ error: "Accès refusé. Token requis." });
  }

  // Vérifier si le token est dans la base de données
  if (!(await checkToken(token))) {
    return res.status(403).json({ error: "Token invalide." });
  }

  // Token valide, on passe à la suite
  next();
};
