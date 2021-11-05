const mongoose = require("mongoose");
// Uno Schema è un costruttore che ci permettere di dire al server come vogliamo
// i nostri dati. Sostanzialmente ci permette di creare un blueprint del document
// che conterrà i nostri dati.
const Schema = mongoose.Schema;

// Qui creiamo il nostro blueprint specificando quali dati vogliamo, il loro
// tipo e sono obbligatori. Tuttavia questo è appunto solo un blueprint, dobbiamo
// ancora creare il model vero e proprio.
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

// Il metodo model, come si può intuire, crea il model vero e proprio, basta dagli
// il nome e uno Schema. Il nome non è a caso ma anzi molto importante, infatti
// 'MongoDB' in automatico prende il nome del model, lo pluralizza e cerca quella
// collections (non è case-sensitive), se non esiste la crea lui. In questo caso
// cercherà la collection 'users'.
const User = mongoose.model("User", userSchema);

// Infine esportiamo il model cosicché possiamo importarlo in altri file.
module.exports = User;
