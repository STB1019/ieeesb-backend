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

const controller = {  
  getArticles: (req, res) => {
    let data = req.query;

    let page = data["page"];
    let step = data["step"];

    let skip = (page-1)*step; 

    console.log(skip, step);
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
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
  }
};

module.exports = controller;
