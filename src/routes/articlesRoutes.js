const {Router} = require("express");
const articlesController = require("../controllers/articlesController");

const router = Router()

router.delete("/articles/:id", articlesController.deleteArticle);

module.exports = router;