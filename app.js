// Esattamente come 'express', 'mongoose' è un framework che ci rende più facile
// interfacciarci con MongoDB. Proprio come non avremmo bisogno di 'express' ma
// potremmo utilizzare i pacchetti di default, non avremmo bisogno neanche
// di 'mongoose', tuttavia entrambi ci semplificano la vita rispetto ai pacchetti
// di default di 'NodeJS' quindi non vedo perché non usarli.
const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user");

const app = express();
const PORT = process.env.PORT || 8080;
const dbURI = "mongodb+srv://stb01019:Kx7RNiWbLNYL4cpW@stb01019.zwwac.mongodb.net/IEEEwebsite?retryWrites=true&w=majority";

// Passandogli il link del database mi connetto ad esso. Infine lil metodo 'connect()'
// è una funzione asincrona ('https://www.youtube.com/watch?v=ZcQyJ-gxke0' qui è
// spiegato bene cosa vuol dire). In breve, JavaScript, invece che aspettare che il
// metodo finisca la sua esecuzione, continua ad eseguire il resto del file e noi
// volendo possiamo aggiungere una funzione di callback per dirgli cosa fare una
// volta che il metodo ha concluso la sua esecuzione.
mongoose.connect(dbURI)
// Con il metodo 'then()' possiamo specificare la funzione di callback da dare ad
// una funzione asincrona. In questo caso faccio in modo che il server inizi ad
//  ascoltare le richieste solo dopo che la connessione con il DB è andata a buon fine.
// Mentre usiamo 'catch()' per "prendere" eventuali errori.
.then((result) => app.listen(PORT, console.log(`Server started on port ${PORT}...`)))
.catch((error) => console.log(error));

// Middleware che codifica i valori di un form, se presenti, in un oggetto javascript.
// Dopo è possibile accedere a questi dati con req.body
app.use(express.urlencoded({ extended: true }));

// Prendo la richiesta di 'post' al route '/post'
app.post("/post", (req, res) => {
  // Prendo i dati che sono stati inviati dal form
  const POST = req.body;
  // Creo un oggetto di tipo User, come attributo il costruttore prende un oggetto che
  // è uguale allo Schema che abbiamo definito nel model.
  const user = new User({
    username: POST["username"],
    password: POST["password"]
  });

  // Con il metodo 'save()' salviamo nella collections questo oggetto. Anche save è
  // asincrono, quindi stesso discorso di 'connect()' con 'then()' e 'catch()'.
  user.save()
  .then((result) => res.send("<p>Aggiunta con successo l'oggetto " + result + " </p>"))
  .catch((error) => console.log(error));

  // Ritorno alla homepage
  // res.redirect("/");
});
