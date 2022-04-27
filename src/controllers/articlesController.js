const mongoose = require("mongoose");
const dbURI = require("../../config.json").dbUri;
const Article = require("../models/article");

// Passandogli il link del database mi connetto ad esso. Infine il metodo 'connect()'
// è una funzione asincrona ('https://www.youtube.com/watch?v=ZcQyJ-gxke0' qui è
// spiegato bene cosa vuol dire). In breve, JavaScript, invece che aspettare che il
// metodo finisca la sua esecuzione, continua ad eseguire il resto del file e noi
// volendo possiamo aggiungere una funzione di callback per dirgli cosa fare una
// volta che il metodo ha concluso la sua esecuzione.
mongoose.connect(dbURI)
// Con il metodo 'then()' possiamo specificare la funzione di callback da dare ad
// una funzione asincrona. In questo caso faccio in modo che il server inizi ad
// ascoltare le richieste solo dopo che la connessione con il DB è andata a buon fine.
// Mentre usiamo 'catch()' per "prendere" eventuali errori.
.then((result) => console.log("All good!"))
.catch((error) => console.log(error));

function updateQuery(previousArticle, article) {
  let query = "{ ";

  if(previousArticle["title"] !== article["title"])
    query += "title: \"" + article["title"] + "\"";
  if(previousArticle["content"] !== article["content"])
    query += ", content: \"" + article["content"] + "\"";
  if(previousArticle["thumbnail"] !== article["thumbnail"])
    query += ", thumbnail: \"" + article["thumbnail"] + "\"";

  query += " }";
  return query;
}

const controller = {
  // Metodo che gestisce una richiesta di tipo 'POST' alla route '/post'.
  patchArticle: (req, res) => {
    // Prendo i dati inviati dal form. I file se c'è ne sono e poi i campi testuali
    let file = req.file;
    let data = req.body;
  
    // Prendo l'articolo precedente e il suo id
    let previousArticle = JSON.parse(data["previousArticle"]);
    let id = req.params.id;
    // Creo un articolo secondo lo Schema creato
    let article = new Article({
      title: data["title"],
      content: data["content"],
      //thumbnail: file["path"]
      thumbnail: data["thumbnail"]
    });

    article.updateOne({ _id: "61b71fe6c9a978e145424069" }, updateQuery(previousArticle, article));
  }
};

module.exports = controller;