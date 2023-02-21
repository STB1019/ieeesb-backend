const mongoose = require('mongoose') // Modulo per dialogare con MongoDB
const dbURI = require('../../config.json').dbUri // Stringa di connessione al DB
const User = require('../models/user') // Modello di un utente
const jwt = require('jsonwebtoken') // Libreria per la creazione di JWT

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
mongoose
  .connect(dbURI)
  .then(() => console.log('DB connected!'))
  .catch(error => console.log(error))

const handleErrors = err => {
  console.log(err.message, err.code)
  let errors = { email: '', password: '' }

  // Email errata durante login
  if (err.message === 'Incorrect email') {
    errors.email = 'That email is not registered!'
  }

  // Password errata durante login
  if (err.message === 'Incorrect password') {
    errors.email = 'That password is incorrect!'
  }

  // Errore email già utilizzata
  if (err.code === 11000) {
    errors.email = 'That email is already registered!'
    return errors
  }

  /**
   * Validazione Errori
   * Prendo tutti gli errori che sono stati generati e per ognuno prendo il suo attributo
   * "properties" e setto l'oggetto errors usando "properties.path", che mi dirà dove l'errore è
   * avvenuto, e a quell'attributo setto il messaggio d'errore usando "properties.message".
   */
  if (err.message.includes('user validation failed')) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message
    })
  }

  return errors
}

const maxAge =
  3 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */
const createToken = id => {
  return jwt.sign({ id }, "kibo's secret", {
    expiresIn: maxAge
  })
}

const controller = {
  postSignup: async (req, res) => {
    let { email, password } = req.body

    try {
      const user = await User.create({ email, password: password })
      const token = createToken(user._id)

      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
      res.status(201).json({ user: user._id })
    } catch (err) {
      const errors = handleErrors(err)

      res.status(400).json({ errors })
    }
  },

  postLogin: async (req, res) => {
    const { email, password } = req.body

    try {
      const user = await User.login(email, password)
      const token = createToken(user._id)

      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
      res.status(200).json({ user: user._id })
    } catch (err) {
      const errors = handleErrors(err)

      res.status(400).json({ errors })
    }
  },

  getLogout: (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 })
    res.redirect('/')
  }
}

module.exports = controller
