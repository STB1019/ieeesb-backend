const {Router} = require("express");
const articlesController = require("../controllers/articlesController");

const router = Router()

router.patch("/articles/:id", articlesController.patchArticle);

module.exports = router;