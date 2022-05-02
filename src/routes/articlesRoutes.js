const multer = require("multer");

const {Router} = require("express");
const articlesController = require("../controllers/articlesController");

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

router.patch("/articles/:id", upload.single("thumbnail"), articlesController.patchArticle);

module.exports = router;