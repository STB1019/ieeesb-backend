// Esattamente come 'express', 'mongoose' è un framework che ci rende più facile
// interfacciarci con MongoDB. Proprio come non avremmo bisogno di 'express' ma
// potremmo utilizzare i pacchetti di default, non avremmo bisogno neanche
// di 'mongoose', tuttavia entrambi ci semplificano la vita rispetto ai pacchetti
// di default di 'NodeJS' quindi non vedo perché non usarli.
const express = require("express");
//const cors = require("cors");
const articlesRoute = require("./src/routes/articlesRoutes");

const app = express();
const PORT = process.env.PORT || 8081;

app.listen(PORT, console.log(`Server started on port ${PORT}...`));

// Utilizziamo il metodo 'use()' per creare un "middleware", codice che viene eseguito
// indipendentemente dalla route che viene richiesta. In questo caso creiamo un
// middleware che, in caso siano presenti, converte i dati inviati da un form HTML in un
// oggetto JavaScript. Questi poi vengono salvati all'interno del body della richiesta nel
// metodo che gestisce la specifica route a cui la richiesta è stata effettuata.
// Il pezzo qui sopra lo tengo perché può tornare utile ma usando "multer" questo lo fai
// lui in automatico.
//app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(articlesRoute)
