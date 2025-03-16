const express = require("express");
const router = express.Router();
const authGuard = require("../middleware/authGuardMiddleWare");
const loadingMiddleWare = require("../middleware/loadingMiddleWare");

const controllers = require("../controllers/playlistControllers");

router.get("/playlist/all", loadingMiddleWare, authGuard, controllers.getAllPlaylist);
router.get("/playlist/get", loadingMiddleWare, authGuard, controllers.getPlaylist);
router.get("/playlist/clear", loadingMiddleWare, authGuard, controllers.clearPlaylist);

router.post("/playlist/new", loadingMiddleWare, authGuard, controllers.newPlaylist);


module.exports = router;