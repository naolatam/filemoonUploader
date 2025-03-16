const express = require("express");
const router = express.Router();
const authGuard = require("../middleware/authGuardMiddleWare");
const loadingMiddleWare = require("../middleware/loadingMiddleWare");

const homeControllers = require("../controllers/homeControllers");

router.get("/", loadingMiddleWare, authGuard, homeControllers.homePage);

module.exports = router;