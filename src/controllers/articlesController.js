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

let confirmationMessages = {
  DELETE: "DELETE request successful"
};

let errorMessages = {
  NOTFOUND: "The researched article wasn't found.",
  CAST: "The id of the requested article is in the wrong format.",
  NEGATIVE: "Page number cannot be negative!",
  DEFAULT: "Something went wrong!\nPlease try again later."
};

const controller = {
  /**
  * Metodo che gestisce una richiesta di tipo "DELETE" al percorso "/articles/:id".
  *
  * @param {*} req Rappresenta la richiesta fatta al server.
  * @param {*} res Rappresenta la risposta del server.
  */
  deleteArticle: (req, res) => {
    /**
    * Per prima cosa prendo il "route parameters" dal percorso a cui è stata fatta la richiesta,
    * quel ":id" serve solo a dare il nome al parametro che assumerà il valore inserito nel
    * percorso.
    */
    let id = req.params.id;

    /**
     * Utilizzo il metodo "findById()" il quale, dato l'id di un articolo lo ricerca all'interno
     * del database.
     * Posso verificarsi 4 casi:
     * 1. La ricerca va a buon fine e l'articolo viene trovato, viene eliminata l'immagine salvata
     * e poi viene eseguito un 'findByIdAndDelete()' che cancella l'articolo dal database e poi,
     * con status code "200 OK" (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200),
     * invia un messaggio di conferma; oppure, in caso di errore, viene impostato lo status code
     * "500 Internal Server Error" (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500)
     * e viene inviato un messaggio d'errore generico come json;
     * 2. Non viene trovato l'articolo trovato ma la ricerca non da errori, significa che
     * l'articolo cercato non è stato trovato o non esiste, vine impostato lo status code
     * "404 Not Found" (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404) e viene
     * inviato un messaggio d'errore come json;
     * 3. Il metodo genera un errore, nello specifico se si tratta di un "CastError", significa che
     * la richiesta è stata posto in maniera errata e quindi viene impostato lo status code
     * "400 Bad Request" (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400) e viene
     * inviato un messaggio d'errore come json;
     * 4. In caso non si tratti di un "CastError" ma di un altro errore viene impostato lo status
     * code "500 Internal Server Error"
     * (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500) e viene inviato un messaggio
     * d'errore generico come json.
     */
    Article.findById(id)
      .then((result) => {
        if (result) {
          fs.unlinkSync(result.thumbnail);

          Article.findByIdAndDelete(id, (error) => {
            if (error)
              console.error(error);
            else
              res.status(200).json(confirmationMessages.DELETE);
          })
        } else
          res.status(404).json(errorMessages.NOTFOUND);
      })
      .catch((error) => {
        if (error.name == "CastError")
          res.status(400).json(errorMessages.CAST);
        else
          res.status(500).json(errorMessages.DEFAULT);
      });
  },
  getArticles: (req, res) => {
    let data = req.query;

    let page = parseInt(data.page, 10);
    let step = parseInt(data.step, 10);
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
  /**
  * Metodo che gestisce una richiesta di tipo "GET" al percorso "/articles/:id".
  *
  * @param {*} req Rappresenta la richiesta fatta al server.
  * @param {*} res Rappresenta la risposta del server.
  */
  getArticleById: (req, res) => {
    /**
    * Per prima cosa prendo il "route parameters" dal percorso a cui è stata fatta la richiesta,
    * quel ":id" serve solo a dare il nome al parametro che assumerà il valore inserito nel
    * percorso.
    */
    let id = req.params.id;

    /**
     * Utilizzo il metodo "findById()" il quale, dato l'id di un articolo lo ricerca all'interno
     * del database.
     * Posso verificarsi 4 casi:
     * 1. La ricerca va a buon fine e l'articolo viene trovato, verrà impostato lo status code
     * "200 OK" (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200) e viene inviato
     * l'articolo trovato come messaggio;
     * 2. Non viene trovato l'articolo trovato ma la ricerca non da errori, significa che
     * l'articolo cercato non è stato trovato o non esiste, vine impostato lo status code
     * "404 Not Found" (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404) e viene
     * inviato un messaggio d'errore come json;
     * 3. Il metodo genera un errore, nello specifico se si tratta di un "CastError", significa che
     * la richiesta è stata posto in maniera errata e quindi viene impostato lo status code
     * "400 Bad Request" (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400) e viene
     * inviato un messaggio d'errore come json;
     * 4. In caso non si tratti di un "CastError" ma di un altro errore viene impostato lo status
     * code "500 Internal Server Error"
     * (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500) e viene inviato un messaggio
     * d'errore generico come json.
     */
    Article.findById(id)
      .then((result) => {
        if (result)
          res.status(200).json(result);
        else
          res.status(404).json(errorMessages.NOTFOUND);
      })
      .catch((error) => {
        if (error.name == "CastError")
          res.status(400).json(errorMessages.CAST);
        else
          res.status(500).json(errorMessages.DEFAULT);
      });
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
    Object.assign(data, { thumbnail: thumbnailPath });
    article = new Article(data);

    /**
     * Procedo con il salvataggio dell'articolo nel database.
     * In caso di successo, restituisco "l'id" dell'articolo appena creato, altrimenti restituisco
     * un messaggio d'errore.
     */
    article.save()
      .then(() => res.status(201).json(article._id))
      .catch((error) => {
        /**
         * Per prima cosa prendo il messaggio d'errore che ho specificato nello schema, tuttavia
         * "mongoose" aggiunge altro di non necessario all'interno del messaggio e di conseguenza
         * utilizziamo un "substr()" per avere solo il messaggio finale.
         */
        let errorMessage = error.message;
        let message = errorMessage.substr(errorMessage.lastIndexOf(":") + 2);

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

    let thumbnail = { thumbnail: path };
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
