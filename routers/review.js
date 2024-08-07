const express = require("express");
const ReviewController = require("../controllers/ReviewController");
const { reviewAuthorization } = require("../middleware/authorization");
const upload = require('../utils/multer')
const router = express.Router()


router.get("/", ReviewController.readReview);

router.post("/", ReviewController.addReview);
router.get("/:id", ReviewController.reviewDetail);
router.delete("/:id", reviewAuthorization, ReviewController.deleteReview);
router.put("/:id", reviewAuthorization, ReviewController.editReview);
router.post("/gemini", ReviewController.gemini);

module.exports = router;
