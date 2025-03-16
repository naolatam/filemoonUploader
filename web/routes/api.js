const express = require("express");
const router = express.Router();
const authGuard = require("../middleware/authGuardMiddleWare");
const controllers = require("../controllers/apiControllers");

router.get("/api/state", controllers.state);

module.exports = router;