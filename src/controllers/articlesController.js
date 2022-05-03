const mongoose = require("mongoose");
const dbURI = require("../../config.json").dbUri;
const Article = require("../models/article");

// Passandogli il link del database mi connetto ad esso. Infine il metodo 'connect()' è una funzione
// asincrona ('https://www.youtube.com/watch?v=ZcQyJ-gxke0' qui è spiegato bene cosa vuol dire). In
// breve, JavaScript, invece che aspettare che il metodo finisca la sua esecuzione, continua ad
// eseguire il resto del file e noi volendo possiamo aggiungere una funzione di callback per dirgli
// cosa fare una volta che il metodo ha concluso la sua esecuzione.
mongoose.connect(dbURI)
// Con il metodo 'then()' possiamo specificare la funzione di callback da dare ad una funzione
// asincrona. In questo caso faccio in modo che il server inizi ad ascoltare le richieste solo dopo
// che la connessione con il DB è andata a buon fine. Mentre usiamo 'catch()' per "prendere"
// eventuali errori.
.then((result) => console.log("All good!"))
.catch((error) => console.log(error));

const controller = {
  // Metodo che gestisce una richiesta di tipo 'DELETE' alla route '/articles'.
  deleteArticle: (req, res) => {
    // Grazie a questo posso prendere i route parameters di questa route
    let id = req.params.id;

    // Elimino l'articolo dal database cercandolo per il suo id
    Article.findByIdAndDelete(id)
    // Invio come risposta una stringa "OK!"
    .then((result) => res.send("OK!"))
    // Stampo il risultato in console in caso di errore (da rivedere)
    .catch((error) => console.log(error));
  }
};

module.exports = controller;