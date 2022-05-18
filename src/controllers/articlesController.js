const mongoose = require("mongoose");
const dbURI = require("../../config.json").dbUri;
const Article = require("../models/article");
const sharp = require("sharp");
const fs = require("fs");

// Passandogli il link del database mi connetto ad esso. Infine il metodo 'connect()' è una
// funzione asincrona ('https://www.youtube.com/watch?v=ZcQyJ-gxke0' qui è <spiegato bene cosa vuol
// dire). In breve, JavaScript, invece che aspettare che il metodo finisca la sua esecuzione,
// continua ad eseguire il resto del file e noi volendo possiamo aggiungere una funzione di
// callback per dirgli cosa fare una volta che il metodo ha concluso la sua esecuzione.
mongoose.connect(dbURI)
  // Con il metodo 'then()' possiamo specificare la funzione di callback da dare ad una funzione
  // asincrona. In questo caso faccio in modo che il server inizi ad ascoltare le richieste solo dopo
  // che la connessione con il DB è andata a buon fine. Mentre usiamo 'catch()' per "prendere"
  // eventuali errori.
  .then(() => console.log("All good!"))
  .catch((error) => console.log(error));

const controller = {
  // Metodo che gestisce una richiesta di tipo 'PATCH' alla route '/articles/:id'.
  patchArticle: (req, res) => {
    // Prendo i dati inviati dal form: il file se c'è e poi i campi testuali. Siccome stiamo
    // salvando l'immagine in RAM invece che su disco è importante sottolineare che ci verrà
    // passata un buffer rappresentante l'immagine.
    let file = req.file;
    let data = req.body;

    let objectID = req.params.id;

    Article.findById(objectID).then((result) => {
      console.log(typeof(result.thumbnail));
      fs.unlinkSync(result.thumbnail);  
    });//.then((result) => result.thumbnail);
    // Genero il percorso dove salvare l'immagine (da rivedere)
    let path = "./uploads/" + Date.now() + ".webp";
    // Utilizzo 'sharp', un modulo che mi permette di manipolare le immagini, per:
    // 1. Prendere il buffer;
    // 2. Convertirlo in 'webp', se necessario;
    // 3. Far diventare il buffer un file e salvar)lo su disco nel percorso specificato.
    if (file.mimetype !== "image/webp")
      sharp(file.buffer).webp().toFile(path);
    else
      sharp(file.buffer).toFile(path);

    let thumbnail = {thumbnail: path};
    Object.assign(data, thumbnail);

    Article.findOneAndUpdate(
      { _id: objectID },
      data,
      { new: true }
    )
      .then(() => res.send("OK!"))
      // Stampo il risultato in console in caso di errore (da rivedere)
      .catch((error) => console.log(error));;
  }
};

module.exports = controller;
