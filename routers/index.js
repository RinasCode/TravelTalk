const express = require("express");
const router = express.Router();
const reviewRouter = require("../routers/review")

const UserController = require("../controllers/UserController");

const authentication = require("../middleware/authentification");
const errorHandler = require("../middleware/errorHandler");



router.post("/register", UserController.addUser);
router.post("/login", UserController.loginUser);
router.post("/google-login", UserController.googleLogin)


router.use(authentication);
router.use("/review",reviewRouter);



router.use(errorHandler);

module.exports = router;
