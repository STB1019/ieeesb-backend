const mongoose = require("mongoose");
// Uno Schema è un costruttore che ci permettere di dire al server come vogliamo
// i nostri dati. Sostanzialmente ci permette di creare un blueprint dell'oggetto
// con cui vogliamo lavorare.
const Schema = mongoose.Schema;

// Qui creiamo il nostro blueprint specificando:
// - I nomi degli attributi,
// - Il loro tipo,
// - Se sono obbligatori o meno per fare in modo che l'oggetto esista.
const articleSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Il titolo dell'articolo è obbligatorio!"]
    },
    subtitle: {
      type: String,
      required: [true, "Il sottotitolo è obbligatorio!"]
    },
    projectName: {
      type: String,
      required: [true, "Il nome del progetto è obbligatorio!"]
    },
    author: {
      type: String,
      required: [true, "L'autore dell'articolo è obbligatorio!"]
    },
    content: {
      type: String,
      required: [true, "Il contenuto dell'articolo è obbligatorio!"]
    },
    thumbnail: {
      type: String,
      required: [true, "La thumbnail dell'articolo è obbligatorio!"]
    }
  },
  { timestamps: true }
);

articleSchema.on("save", (doc, next) => {
  console.log(doc, next);
});

// Il metodo model, come si può intuire, crea il model vero e proprio, basta dargli
// il nome della collection dove verranno salvati gli oggetti di questo tipo e uno
// Schema. Il nome non è a caso ma anzi molto importante, infatti 'MongoDB' in
// automatico prende il nome del model, lo pluralizza e cerca quella collection
// (non è case-sensitive), se non esiste la crea lui. In questo caso, per esempio,
// cercherà la collection 'articles'.
const Article = mongoose.model("Article", articleSchema);

// Infine esportiamo il model cosicché possiamo importarlo e usarlo in altri file.
module.exports = Article;
