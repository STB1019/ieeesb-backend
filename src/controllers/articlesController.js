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
.then(() => console.log("DB connected!"))
.catch((error) => console.log(error));

const controller = {
  // Metodo che gestisce una richiesta di tipo 'DELETE' alla route '/articles'.
  deleteArticle: (req, res) => {
    // Grazie a questo posso prendere i route parameters di questa route
    let id = req.params.id;

    // Elimino l'articolo dal database cercandolo per il suo id
    Article.findByIdAndDelete(id)
    // Invio come risposta una stringa "OK!"
    .then(() => res.send("pDELETE request executed!"))
    // Stampo il risultato in console in caso di errore (da rivedere)
    .catch((error) => console.log(error));
  },
  getArticles: (req, res) => {
    let data = req.query;

    let page = parseInt(data["page"], 10);
    let step = parseInt(data["step"], 10);

    let skip = (page - 1) * step;

    // Il metodo find ritorna una lista con tutti gli articoli presenti nel DB
    // è possibile utilizzare 'skip' e 'limit' per la paginazione. 'skip' indica quanti 
    // elementi del database saltare mentre 'limit' indica quanti elementi possono
    // stare in una singola pagina.
    /* Non capisco perché così non funziona, ma se metto i "magic number" al posto delle variabili
    funziona :( */
    Article.find().skip(skip).limit(step)
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
  },
  getArticleById: (req, res) => {
    // Grazie a questo posso prendere i route parameters di questa route
    let id = req.params.id;

    // findById ritorna l'articolo che corrisponde a quell'id
    Article.findById(id)
      .then((result) => res.send(result))
      .catch((err) => console.log(err));
  },
  /**
   * Metodo che gestisce una richiesta di tipo "POST" al percorso "/articles".
   * 
   * @param {*} req Rappresenta la richiesta fatta al server.
   * @param {*} res Rappresenta la risposta del server.
   */
  postArticle: (req, res) => {
    /**
     * Prendo i dati inviati dal form:
     * 1. "req.file" conterrà qualsiasi file intercettato da "multer", modulo utile per il passaggio
     *    e salvataggio di immagini attraverso i form;
     * 2. "req.body" conterrà tutti i campi testuali.
     */
    let file = req.file;
    let data = req.body;
    let thumbnailPath = "./uploads/" + Date.now() + ".webp";
    let article;

    /**
     * Per gestire le immagini utilizzo "sharp", un modulo che permette di manipolare le immagini.
     * Essendo che l'immagine è stata salvata nella RAM da "multer", quello che avremmo è un buffer
     * (uno dei motivi dell'utilizzo "sharp" è proprio perché permette di utilizzare i buffer) e,
     * dopo aver verificato che il file non sia già nel formato "webp", semplicemente facciamo:
     * 1. "sharp(file.buffer)" inizializza "sharp" partendo dal buffer;
     * 2. ".webp()" converte il buffer nel formato "webp";
     * 3. ".toFile(thumbnailPath)" salva il buffer su disco fisso nel percorso specificato.
     */
    if (file.mimetype !== "image/webp")
      sharp(file.buffer).webp().toFile(thumbnailPath);
    else
      sharp(file.buffer).toFile(thumbnailPath);

    /**
     * Per prima cosa aggiungo all'oggetto "data", contenente i campi testuali, il campo
     * "thumbnail" avente come valore il percorso di dove è stata salvata la thumbnail e poi
     * procedo con il creare l'article secondo lo schema specificato.
     */
    Object.assign(data, {thumbnail: thumbnailPath});
    article = new Article(data);

    /**
     * Procedo con il salvataggio dell'articolo nel database.
     * In caso di successo, restituisco "l'id" dell'articolo appena creato, altrimenti restituisco
     * un messaggio d'errore.
     */
    article.save()
    .then(() => res.send(article._id))
    .catch((error) => {
      /**
       * Per prima cosa prendo il messaggio d'errore che ho specificato nello schema, tuttavia
       * "mongoose" aggiunge altro di non necessario all'interno del messaggio e di conseguenza
       * utilizziamo un "substr()" per avere solo il messaggio finale.
       */
      let errorMessage = error.message;
      let message = errorMessage.substr(errorMessage.lastIndexOf(":")+2);

      /**
       * Qui verifichiamo se si tratta di un'errore di validazione, in caso affermativo ritorniamo
       * l'errore settando lo status code "422 Unprocessable Entity"
       * (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/422). In caso contrario
       * ritorniamo l'errore settando lo status code "500 Internal Server Error"
       * (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500).
       */
      if (error.name == "ValidationError") {
        res.status(422).json(message);
      } else {
        res.status(500).json(message);
      }
    });
  },
  // Metodo che gestisce una richiesta di tipo 'PATCH' alla route '/articles/:id'.
  patchArticle: (req, res) => {
    // Prendo i dati inviati dal form: il file se c'è e poi i campi testuali. Siccome stiamo
    // salvando l'immagine in RAM invece che su disco è importante sottolineare che ci verrà
    // passata un buffer rappresentante l'immagine.
    let file = req.file;
    let data = req.body;
    let objectID = req.params.id;
    let getAndDeleteArticle = () => {
      Article.findById(objectID)
      .then((result) => {
        let path = result.thumbnail;
        fs.unlinkSync(path);  
      });
    };

    // Genero il percorso dove salvare l'immagine (da rivedere)
    let path = "./uploads/" + Date.now() + ".webp";
    // Utilizzo "sharp", un modulo che mi permette di manipolare le immagini, per:
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
    .then(() => {
      getAndDeleteArticle();
      res.send("PATCH request executed!");
    })
    // Stampo il risultato in console in caso di errore (da rivedere)
    .catch((error) => console.log(error));;
  }
};

module.exports = controller;
