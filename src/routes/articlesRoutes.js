const { Router } = require('express')
const articlesController = require('../controllers/articlesController')
const multer = require('multer')

const router = Router()

// Salva l'immagine nella RAM invece che su disco
const upload = multer({
  storage: multer.memoryStorage()
})

// Associo ad una richiesta di tipo 'DELETE' sulla route '/articles/:id' alla funzione
// 'deleteArticle' del controller
router.delete('/articles/:id', articlesController.deleteArticle)

// Associo ad una richiesta di tipo 'GET' sulla route '/articles/:id' e '/articles' alle funzioni
// 'getArticles' e 'getArticlesById' del controller
router.get('/articles', articlesController.getArticles)
router.get('/articles/:id', articlesController.getArticleById)

// Associo ad una richiesta di tipo 'POST' sulla route '/articles' alla funzione
// 'postArticle' del controller
router.post(
  '/articles',
  upload.single('thumbnail'),
  articlesController.postArticle
)

// Associo ad una richiesta di tipo 'PATCH' sulla route '/articles/:id' alla funzione
// 'patchArticle' del controller
router.patch(
  '/articles/:id',
  upload.single('thumbnail'),
  articlesController.patchArticle
)

module.exports = router
