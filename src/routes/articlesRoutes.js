const {Router} = require("express");
const articlesController = require("../controllers/articlesController");

const router = Router()

router.get("/articles", articlesController.getArticles);
router.get("/articles/:id", articlesController.getArticleById);

module.exports = router;
// Richiedo la funzione router dal modulo 'express' per gestire le varie route
const {Router} = require("express");
// Richiedo il controller degli articoli
const articlesController = require("../controllers/articlesController");

// Creo l'oggetto router vero e proprio che mi permette di gestire le route
const router = Router()

// Associo ad una richiesta di tipo 'DELETE' sulla route '/articles/:id' alla funzione
// 'deleteArticle' del controller
router.delete("/articles/:id", articlesController.deleteArticle);

// Associo ad una richiesta di tipo 'GET' sulla route '/articles/:id' e '/articles' alle funzioni
// 'getArticles' e 'getArticlesById' del controller
router.get("/articles", articlesController.getArticles);
router.get("/articles/:id", articlesController.getArticleById);

module.exports = router;