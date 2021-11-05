const mongoose = require("mongoose");
// Uno Schema è un costruttore che ci permettere di dire al server come vogliamo
// i nostri dati. Sostanzialmente ci permette di creare un blueprint dell'oggetto
// con cui vogliamo lavorare.
const Schema = mongoose.Schema;

// Qui creiamo il nostro blueprint specificando:
// - I nomi degli attributi,
// - Il loro tipo,
// - Se sono obbligatori o meno per fare in modo che l'oggetto esista.
const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

// Il metodo model, come si può intuire, crea il model vero e proprio, basta dargli
// il nome della collection dove verranno salvati gli oggetti di questo tipo e uno
// Schema. Il nome non è a caso ma anzi molto importante, infatti 'MongoDB' in
// automatico prende il nome del model, lo pluralizza e cerca quella collection
// (non è case-sensitive), se non esiste la crea lui. In questo caso, per esempio,
// cercherà la collection 'users'.
const User = mongoose.model("User", userSchema);

// Infine esportiamo il model cosicché possiamo importarlo e usarlo in altri file.
module.exports = User;
