const { Author, Review } = require("../models");

async function reviewAuthorization(req, res, next) {
  try {
    const { userId } = req.loginInfo;

    // console.log(userId);

    // console.log(req.params);

    const user = await Author.findByPk(userId);

    // console.log(user);

    if (!user) throw { name: "Forbidden" };

    const { id } = req.params;
    // console.log(id);
    const selectedReview = await Review.findByPk(id);
    // console.log(selectedReview);
    if (!selectedReview) throw { name: "Review Not Found" };

    if (selectedReview.authorId !== user.id) throw { name: "Forbidden" };

    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
}

module.exports = { reviewAuthorization };
