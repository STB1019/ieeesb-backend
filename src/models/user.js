const mongoose = require('mongoose')
const { isEmail } = require('validator')
const { scryptSync, randomBytes, timingSafeEqual } = require('crypto')

/**
 * Uno Schema è un costruttore che ci permettere di dire al server come vogliamo i nostri dati.
 * Sostanzialmente ci permette di creare un blueprint dell'oggetto con cui vogliamo lavorare.
 */
const Schema = mongoose.Schema

/**
 * Qui creiamo il nostro blueprint specificando:
 * - I nomi degli attributi
 * - Il loro tipo
 * - Se sono obbligatori o meno per fare in modo che l'oggetto esista
 */
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'The email is required!'],
      unique: true,
      lowercase: true,
      validate: [isEmail, 'Please enter a valid email!']
    },
    password: {
      type: String,
      required: [true, 'The password is required!'],
      minlength: [8, 'Minimum password length is 8 characters']
    }
  },
  { timestamps: true }
)

/**
 * Lancia la funzione prima che l'entità venga salvata nel DB.
 * La funzione procedo con la creazione dell'hash della password con salatura per poi sostituirla
 * alla password dell'utente.
 */
userSchema.pre('save', function (next) {
  const salt = randomBytes(16).toString('hex')
  const hashedPassword = scryptSync(this.password, salt, 64).toString('hex')

  this.password = `${salt}:${hashedPassword}`

  next()
})

userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email })

  if (user) {
    const [salt, key] = user.password.split(':')
    const hashedBuffer = scryptSync(password, salt, 64)

    const keyBuffer = Buffer.from(key, 'hex')
    const match = timingSafeEqual(hashedBuffer, keyBuffer)

    if (match) return user

    throw Error('Incorrect password')
  }

  throw Error('Incorrect email')
}

/**
 * Il metodo "model", come si può intuire, crea il model vero e proprio, basta dargli il nome della
 * collection dove verranno salvati gli oggetti di questo tipo e uno "Schema". Il nome non è a caso
 * ma anzi molto importante, infatti 'MongoDB' in automatico prende il nome del model, lo
 * pluralizza e cerca quella collection (non è case-sensitive), se non esiste la crea lui. In
 * questo caso, per esempio, cercherà la collection 'users'.
 */
const User = mongoose.model('User', userSchema)

/**
 * Infine esportiamo il model cosicché possiamo importarlo e usarlo in altri file.
 */
module.exports = User
