const controller = {
  // Metodo che gestisce una richiesta di tipo 'POST' alla route '/post'.
  printImages: (req, res) => {
    let images = req.files;
  
    res.send(images);
  
    /*images.forEach(image => {
      let encoded = base64_encode(image.path);
      console.log(encoded);
    });*/
  
    // Come dicevo prima, prendo i dati inviati dal form, che sono stati salvati dal
    // middleware nel body della richiesta, e li salvo in una variabile.
    //const POST = req.body; TO UNCOMMENT
    // Creo un oggetto di tipo User, come attributo il costruttore prende un oggetto che
    // è uguale allo Schema che abbiamo definito nel model.
    /*const user = new User({
      username: POST["username"],
      password: POST["password"]
    }); TO UNCOMMENT */ 
  
    // Con il metodo 'save()' salviamo nella collections questo oggetto. Anche save è
    // asincrono, quindi stesso discorso di 'connect()' con 'then()' e 'catch()'.
    /*user.save()
    .then((result) => res.send("<p>Aggiunta con successo l'oggetto " + result + " </p>"))
    .catch((error) => console.log(error)); TO UNCOMMENT */
  
    // Ritorno alla homepage
    //res.redirect("/"); TO UNCOMMENT
  }
};

module.exports = controller;
