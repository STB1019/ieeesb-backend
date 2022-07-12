const mongoose = require("mongoose"); // Modulo per dialogare con MongoDB
const dbURI = require("../../config.json").dbUri; // Stringa di connessione al DB
const Article = require("../models/article"); // Modello di un articolo
const sharp = require("sharp"); // Modulo di manipolazione immagini
const fs = require("fs"); // Modulo per utilizzare il File System

/*
 * Passando "dbURI" al metodo "connect()" mi permette di connettermi al DB salvato su MongoDB Atlas.
 * È giusto precisare che il metodo "connect()" è asincrono
 * ("https://www.youtube.com/watch?v=ZcQyJ-gxke0" qui è spiegato bene). In parole povere JavaScript
 * non aspetta che il metodo finisca la sua esecuzione ma continua a leggere il resto del file
 * anche se il metodo non ha finito di eseguire il suo codice.
 * Successivamente utilizziamo il metodo "then()", in caso la connessione sia andata a buon fine,
 * per stampare un messaggio di avvenuta connessione in console; oppure il metodo "catch()", in
 * caso la connessione non sia avvenuta, per stampare l'errore in console.
 */
mongoose.connect(dbURI)
  .then(() => console.log("DB connected!"))
  .catch((error) => console.log(error));

/**
 * Array associativo che tiene traccia dei messaggi di successo delle varie operazioni
 */
const confirmationMessages = {
  DELETE: "DELETE request successful"
};

/**
 * Array associativo che tiene traccia dei messaggi d'errore delle varie operazioni.
 */
const errorMessages = {
  NOT_FOUND: "The researched article wasn't found.",
  CAST: "The id of the requested article is in the wrong format.",
  NEGATIVE_PAGE: "Page number must be greater than zero!",
  NEGATIVE_STEP: "Step must be greater or equal than zero!",
  IMAGE_FORMAT: "The file sent is is not supported!",
  EMPTY_PATCH: "Can't patch if nothing is sent!",
  DEFAULT: "Something went wrong!\nPlease try again later."
};

const thumbnailPath = __dirname + "/../../uploads/";
const saveThumbnail = (data, file) => {
  let thumbnailName = Date.now() + ".webp";
  let allowedExts = ["image/png", "image/jpeg", "image/webp", "image/gif"];

  if (allowedExts.includes(file.mimetype)) {
    /**
     * Essendo che l'immagine è stata salvata nella RAM da "multer", quello che avremmo è un buffer
     * (uno dei motivi dell'utilizzo "sharp" è proprio perché permette di utilizzare i buffer) e,
     * dopo aver verificato che il file non sia già nel formato "webp", semplicemente facciamo:
     * 1. "sharp(file.buffer)" inizializza "sharp" partendo dal buffer;
     * 2. ".webp()" converte il buffer nel formato "webp";
     * 3. ".toFile(thumbnailPath)" salva il buffer su disco fisso nel percorso specificato.
     */
    if (file.mimetype != "image/webp")
      sharp(file.buffer).webp().toFile(thumbnailPath + thumbnailName);
    else
      sharp(file.buffer).toFile(thumbnailPath + thumbnailName);

    /**
     * Aggiungo all'oggetto "data", contenente i campi testuali, il campo
     * "thumbnail" avente come valore il percorso di dove è stata salvata la thumbnail.
     */
    Object.assign(data, { thumbnail: thumbnailName });
  }
};

/**
 * Array associativo con all'interno diverse funzioni da associare alle varie routes.
 */
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
     * del database. In questo caso aggiungo anche l'opzione "{ thumbnail: true }" in modo da
     * ricevere solo id e thumbnail, che sono gli unici due parametri di cui ho bisogno.
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
    Article.findById(id, { thumbnail: true })
      .then((result) => {
        if (result) {

          Article.findByIdAndDelete(result.id, (error) => {
            if (error)
              console.error(error);
            else {
              res.status(200).json(confirmationMessages.DELETE);
              fs.unlinkSync(thumbnailPath + result.thumbnail);
            }
          })
        } else
          res.status(404).json(errorMessages.NOT_FOUND);
      })
      .catch((error) => {
        if (error.name == "CastError")
          res.status(400).json(errorMessages.CAST);
        else
          res.status(500).json(errorMessages.DEFAULT);
      });
  },
  /**
   * Metodo che gestisce una richiesta di tipo "GET" al percorso "/articles".
   *
   * @param {*} req Rappresenta la richiesta fatta al server.
   * @param {*} res Rappresenta la risposta del server.
   */
  getArticles: (req, res) => {
    /**
     * Per prima cosa prendo i "query parameters" che erano nella richiesta, infatti la richiesta
     * sarà fatta nel formato "/articles?page=1&step=4". I numeri qui sono solo placeholder, page
     * indica a che pagina siamo mentre step indica quanti articoli per pagina si vuole visualizzare.
     * In caso la richiesta venga fatta senza i parametri "page" e "step" verranno ritornati tutti
     * gli articoli presenti nel database.
     */
    let data = req.query;
    let page = parseInt(data.page, 10);
    let step = parseInt(data.step, 10);

    /**
     * Verifico che sia page che step siano nel formato corretto, in caso contrario invio uno
     * specifico errore utilizzando lo status code "400 Bad Request"
     * (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400). Poi calcolo quanti articoli
     * sarà necessario saltare, partendo dalla pagina 0 e moltiplicando per quanti articoli voglio
     * per pagina.
     */
    if (page <= 0) {
      res.status(400).json(errorMessages.NEGATIVE_PAGE);
      return;
    }

    if (step < 0) {
      res.status(400).json(errorMessages.NEGATIVE_STEP);
      return;
    } else if (step == 0) {
      res.status(200).json([]);
      return;
    }

    let skip = (page - 1) * step;

    /**
     * Utilizzo il metodo "find()" per prendere tutti gli articoli del database aggiungendo i metodi
     * "skip()" e "limit()": il primo dice quanti documenti saltare partendo dal primo, il secondo
     * dice quanti prenderne. In caso di successo verrà impostato lo status code "200 OK"
     * (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200) e saranno inviati gli articoli
     * sotto forma di json. In caso di errore viene impostato lo status code
     * "500 Internal Server Error" (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500) e
     * viene inviato un messaggio d'errore generico come json.
     */
    Article.find().skip(skip).limit(step)
      .then((result) => res.status(200).json(result))
      .catch(() => res.status(500).json(errorMessages.DEFAULT));
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
          res.status(404).json(errorMessages.NOT_FOUND);
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
     * Salvo qualsiasi file e testo venga inviato a questa route tramite "POST" request.
     * Creo il percorso dove salvare la "thumbnail".
     * Creo l'articolo che dovrò "postare" e infine creo un array contenente tutti i tipi di
     * immagine accettabili.
     */
    let file = req.file;
    let data = req.body;
    let article;

    /**
     * Prima di procedere con il salvataggio dell'immagine verifico che sia stata inviata.
     */
    if (typeof file != "undefined" && file != null) {
      /**
       * Una volta saputo che l'immagine è stata inviata procedo a verificare che sia in una delle
       * estensioni consentite prima di salvarla su disco.
       */
      saveThumbnail(data, file);
    } else {
      res.status(400).json(errorMessages.IMAGE_FORMAT);
      return;
    }

    /**
     * Creo l'articolo con i dati che mi sono stati inviati.
     */
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
  /**
   * Metodo che gestisce una richiesta di tipo "PATCH" al percorso "/articles/:id".
   * 
   * @param {*} req Rappresenta la richiesta fatta al server.
   * @param {*} res Rappresenta la risposta del server.
   */
  patchArticle: (req, res) => {
    /**
     * Salvo qualsiasi file e testo venga inviato a questa route tramite "PATCH" request.
     * Creo un booleano che mi tiene traccia se è stato inviato un file o meno.
     */
    let file = req.file;
    let data = req.body;
    let doesThumbnailExists = true;

    /**
     * Verifico che almeno i campi di testo siano stati inviati altrimenti imposto lo status code
     * "400 Bad Request" (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400) e invio un
     * messaggio d'errore in formato json.
     */
    if (typeof file === "undefined" || file === null) {
      doesThumbnailExists = false;

      if (typeof data === "undefined" || data === null) {
        res.status(400).json(errorMessages.EMPTY_PATCH);
        return;
      }
    }

    /**
     * Prendo l'id dell'articolo e poi creo una funziona che cerca ed elimina la vecchia thumbnail
     * dell'articolo.
     */
    let id = req.params.id;
    let getAndDeleteThumbnail = () => {
      Article.findById(id, { thumbnail: true })
        .then((result) => {
          fs.unlinkSync(result.thumbnail);
        })
        .catch((error) => {
          if (error.name === "CastError")
            res.status(400).json(errorMessages.CAST);
          else
            res.status(500).json(errorMessages.DEFAULT);
        });
    };

    /**
     * In caso una nuova thumbnail mi è stata inviata la salvo su disco.
     */
    if (doesThumbnailExists) {
      saveThumbnail(data, file);
    }

    /**
     * Cerco l'articolo tramite l'id e sostituisco i parametri presenti in "data".
     * Ci possono essere 3 casi:
     * 1. L'esecuzione del metodo va a buon fine, cancello la vecchia thumbnail in caso sia stata
     * aggiornata e poi imposto lo status code a "200 OK"
     * (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200) inviando l'articolo
     * modificato in formato json come risposta;
     * 2. Il metodo genera un errore, nello specifico se si tratta di un "CastError", significa che
     * la richiesta è stata posto in maniera errata e quindi viene impostato lo status code
     * "400 Bad Request" (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400) e viene
     * inviato un messaggio d'errore come json;
     * 3. In caso non si tratti di un "CastError" ma di un altro errore viene impostato lo status
     * code "500 Internal Server Error"
     * (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500) e viene inviato un messaggio
     * d'errore generico come json.
     */
    Article.findOneAndUpdate({ _id: id }, data)
      .then((patchedArticle) => {
        if (doesThumbnailExists)
          getAndDeleteThumbnail();

        res.status(200).json(patchedArticle);
      })
      .catch((error) => {
        if (error.name == "CastError")
          res.status(400).json(errorMessages.CAST);
        else
          res.status(500).json(errorMessages.DEFAULT);
      });
  }
};

module.exports = controller;
