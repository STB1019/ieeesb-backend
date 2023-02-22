/**
 * Il pacchetto "express" è un framework che ci aiuta ad interfacciarci e a creare un webserver in
 * pochi semplici passaggi. Anche il pacchetto "mongoose" è un framework, questa volta per
 * facilitare l'interfacciamento con MongoDB.
 * L'utilizzo di un framework come express o mongoose non è necessario, potremmo usare i pacchetti
 * forniti da Node, tuttavia questo ci semplifica la vita non poco.
 */
const express = require('express')
const mongoose = require('mongoose')
/**
 * Stringa di connessione per il DB salvato su MongoDB Atlas.
 */
const dbURI = require('./config.json').dbUri
/**
 * Crea un "middleware" ('https://developer.mozilla.org/en-US/docs/Glossary/Middleware' per sapere
 * che cos'è un middleware) che permette di gestire le CORS (
 * 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS' per sapere cosa sono e perché sono
 * utili le Cross-Origin Resource Sharing).
 * N.B: Da tenere commentato se in development ma necessario rimuovere commento in production (da
 * capire se è veramente necessaria questa cosa).
 */
//const cors = require('cors')
/**
 * Altro middleware, questa volta per la gestione dei cookies.
 */
const cookieParser = require('cookie-parser')
const projectsRoutes = require('./src/routes/projectsRoutes')
const articlesRoutes = require('./src/routes/articlesRoutes')
const authRoutes = require('./src/routes/authRoutes')

const app = express()
const PORT = process.env.PORT || 8081

app.listen(PORT, console.log(`Server started on port ${PORT}...`))

// Utilizziamo il metodo 'use()' per creare un "middleware", codice che viene eseguito
// indipendentemente dalla route che viene richiesta. In questo caso creiamo un
// middleware che, in caso siano presenti, converte i dati inviati da un form HTML in un
// oggetto JavaScript. Questi poi vengono salvati all'interno del body della richiesta nel
// metodo che gestisce la specifica route a cui la richiesta è stata effettuata.
// Il pezzo qui sopra lo tengo perché può tornare utile ma usando "multer" questo lo fai
// lui in automatico.
//app.use(cors());
app.use(express.static(__dirname + '/uploads'))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

mongoose.connect(dbURI).then(
  value => console.log(`DB connected!\n${value}`),
  reason => console.log(reason)
)

app.use(authRoutes)
app.use(projectsRoutes)
app.use(articlesRoutes)
