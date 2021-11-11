// Esattamente come 'express', 'mongoose' è un framework che ci rende più facile
// interfacciarci con MongoDB. Proprio come non avremmo bisogno di 'express' ma
// potremmo utilizzare i pacchetti di default, non avremmo bisogno neanche
// di 'mongoose', tuttavia entrambi ci semplificano la vita rispetto ai pacchetti
// di default di 'NodeJS' quindi non vedo perché non usarli.
const express = require("express");
const mongoose = require("mongoose");
const config = require("./config.json");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 8081;
const dbURI = config.dbUri

const articlesRoute = require("./src/routes/articlesRoutes");


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

app.use(articlesRoute)