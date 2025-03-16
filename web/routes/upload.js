const express = require("express");
const router = express.Router();
const authGuard = require("../middleware/authGuardMiddleWare");
const loadingMiddleWare = require("../middleware/loadingMiddleWare");
const uploadController = require("../controllers/uploadControllers");

router.get("/upload", loadingMiddleWare, authGuard, uploadController.uploadPage);
router.get("/local-files", loadingMiddleWare, authGuard, uploadController.localFiles);
router.get("/remote-folders", loadingMiddleWare, authGuard, uploadController.remoteFolders);
router.get("/remote-folders/new", loadingMiddleWare, authGuard, uploadController.newRemoteFolder);


module.exports = router;