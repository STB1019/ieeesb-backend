const {Router} = require("express");
const articlesController = require("../controllers/articlesController");

const router = Router()

router.get("/articles", articlesController.getArticles);
router.get("/articles/:id", articlesController.getArticleById);

module.exports = router;
