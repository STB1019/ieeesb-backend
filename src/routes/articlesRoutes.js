const multer = require("multer");
const path = require("path");

const {Router} = require("express");
const articlesController = require("../controllers/articlesController");

const router = Router()


// Imposto dove salvare l'immagine e che nome dargli; poi imposto anche un filtro
// per controllare l'estensione del file
const imageStorage = multer.diskStorage({
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

    cb(new Error("The file must be an image!"));
  }
});

router.patch("/articles/:id", upload.single("thumbnail"), articlesController.patchArticle);

module.exports = router;