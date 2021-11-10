// Esattamente come 'express', 'mongoose' è un framework che ci rende più facile
// interfacciarci con MongoDB. Proprio come non avremmo bisogno di 'express' ma
// potremmo utilizzare i pacchetti di default, non avremmo bisogno neanche
// di 'mongoose', tuttavia entrambi ci semplificano la vita rispetto ai pacchetti
// di default di 'NodeJS' quindi non vedo perché non usarli.
const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user");
const config = require("./config.json");
// Utilizzo "multer" per gestire l'upload dei file 
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 8080;
const dbURI = config.dbUri
// Imposto dove salvare l'immagine e che nome dargli; poi imposto anche un filtro
// per controllare l'estensione del file
const imageStorage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
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

// Passandogli il link del database mi connetto ad esso. Infine il metodo 'connect()'
// è una funzione asincrona ('https://www.youtube.com/watch?v=ZcQyJ-gxke0' qui è
// spiegato bene cosa vuol dire). In breve, JavaScript, invece che aspettare che il
// metodo finisca la sua esecuzione, continua ad eseguire il resto del file e noi
// volendo possiamo aggiungere una funzione di callback per dirgli cosa fare una
// volta che il metodo ha concluso la sua esecuzione.
// mongoose.connect(dbURI) TO UNCOMMENT
// Con il metodo 'then()' possiamo specificare la funzione di callback da dare ad
// una funzione asincrona. In questo caso faccio in modo che il server inizi ad
// ascoltare le richieste solo dopo che la connessione con il DB è andata a buon fine.
// Mentre usiamo 'catch()' per "prendere" eventuali errori.
/*.then((result) => app.listen(PORT, console.log(`Server started on port ${PORT}...`)))
.catch((error) => console.log(error)); TO UNCOMMENT */

app.listen(PORT, console.log(`Server started on port ${PORT}...`)) // TO REMOVE

// Utilizziamo il metodo 'use()' per creare un "middleware", codice che viene eseguito
// indipendentemente dalla route che viene richiesta. In questo caso creiamo un
// middleware che, in caso siano presenti, converte i dati inviati da un form HTML in un
// oggetto JavaScript. Questi poi vengono salvati all'interno del body della richiesta nel
// metodo che gestisce la specifica route a cui la richiesta è stata effettuata.
// Il pezzo qui sopra lo tengo perché può tornare utile ma usando "multer" questo lo fai
// lui in automatico.

const base64_encode = (file) => {
  let bitmap = fs.readFileSync(file);

  return Buffer.from(bitmap).toString("base64");
};

// Metodo che gestisce una richiesta di tipo 'POST' alla route '/post'.
app.post("/articles", upload.array("images"), (req, res) => {
  let images = req.files;

  console.log(images, req.body);

  /*images.forEach(image => {
    let encoded = base64_encode(image.path);
    console.log(encoded);
  });*/

  // Come dicevo prima, prendo i dati inviati dal form, che sono stati salvati dal
  // middleware nel body della richiesta, e li salvo in una variabile.
  //const POST = req.body; TO UNCOMMENT
  // Creo un oggetto di tipo User, come attributo il costruttore prende un oggetto che
  // è uguale allo Schema che abbiamo definito nel model.
  /*const user = new User({
    username: POST["username"],
    password: POST["password"]
  }); TO UNCOMMENT */ 

  // Con il metodo 'save()' salviamo nella collections questo oggetto. Anche save è
  // asincrono, quindi stesso discorso di 'connect()' con 'then()' e 'catch()'.
  /*user.save()
  .then((result) => res.send("<p>Aggiunta con successo l'oggetto " + result + " </p>"))
  .catch((error) => console.log(error)); TO UNCOMMENT */

  // Ritorno alla homepage
  res.redirect("/");
});
