// Fichier principal (server.js, app.js, index.js, etc.)
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const initializePassport = require("./passport-config");
const { sendConfirmationEmail } = require("./emailUtils");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

// Fonctions pour récupérer l'utilisateur par email et ID (à adapter selon votre implémentation)
async function getUserByEmail(email) {
  // Récupérez l'utilisateur à partir de votre base de données en utilisant l'email
}

async function getUserById(id) {
  // Récupérez l'utilisateur à partir de votre base de données en utilisant l'ID
}

initializePassport(passport, getUserByEmail, getUserById);

const app = express();

// Configuration de l'application Express
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "votre secret de session",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Ajoutez les routes d'authentification et d'inscription ici
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard", // Redirection en cas de succès
    failureRedirect: "/login", // Redirection en cas d'échec
    failureFlash: true, // Autoriser les messages flash d'erreur
  })
);
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Vérifiez si l'utilisateur existe déjà
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      // Gérez l'erreur (redirigez vers la page d'inscription avec un message d'erreur, par exemple)
      return;
    }

    // Hachez le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Générez un jeton de confirmation unique
    const confirmationToken = uuidv4();

    // Créez un nouvel utilisateur et enregistrez-le dans la base de données
    const newUser = {
      name,
      email,
      password: hashedPassword,
      confirmationToken, // Ajoutez le jeton de confirmation à l'utilisateur
    };
    // Sauvegardez le nouvel utilisateur dans la base de données

    // Envoyez l'e-mail de confirmation à l'utilisateur
    await sendConfirmationEmail(email, confirmationToken);

    // Redirigez l'utilisateur vers la page de connexion ou de réussite
    res.redirect("/login");
  } catch (err) {
    // Gérez l'erreur (redirigez vers la page d'inscription avec un message d'erreur, par exemple)
  }
});

// Démarrez le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
