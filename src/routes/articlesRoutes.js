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

// Imposto dove salvare l'immagine e che nome dargli; poi creo l'oggetto per caricare i file e
// anche il filtro per filtrare solo le immagini
/*const imageStorage = multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });

const upload = multer({
    storage: imageStorage,
    fileFilter: (req, file, cb) => {
      if(path.extname(file.originalname).match(/[\/.](gif|jpg|jpeg|tiff|png)$/i))
        return cb(null, true);
  
      cb(new Error("Il file deve essere un'immagine!"));
    }
  });*/
// Salva l'immagine nella RAM invece che su disco
const upload = multer({ storage: multer.memoryStorage() });

// Associo ad una richiesta di tipo 'DELETE' sulla route '/articles/:id' alla funzione
// 'deleteArticle' del controller
router.delete("/articles/:id", articlesController.deleteArticle);

// Associo ad una richiesta di tipo 'GET' sulla route '/articles/:id' e '/articles' alle funzioni
// 'getArticles' e 'getArticlesById' del controller
router.get("/articles", articlesController.getArticles);
router.get("/articles/:id", articlesController.getArticleById);

// Associo ad una richiesta di tipo 'POST' sulla route '/articles' alla funzione
// 'postArticle' del controller
router.post("/articles", upload.single("thumbnail"), articlesController.postArticle);

module.exports = router;