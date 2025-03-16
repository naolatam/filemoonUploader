const express = require("express");
const router = express.Router();
const authGuard = require("../middleware/authGuardMiddleWare");
const oldControllers = require("../controllers/oldControllers");

router.get("/old",oldControllers.oldPage);

module.exports = router;