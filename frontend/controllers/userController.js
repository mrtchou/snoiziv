// Importation des dépendances
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const { JWT_SECRET, EMAIL_USERNAME, EMAIL_PASSWORD } = process.env;

// Fonction d'inscription
exports.signup = async (req, res) => {
  // Vérification des erreurs de validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Si des erreurs sont présentes, retourner un statut 400 avec les erreurs
    return res.status(400).json({ errors: errors.array() });
  }

  // Récupération des données d'inscription depuis la requête
  const { email, password, ...rest } = req.body;

  try {
    // Vérification de l'existence d'un utilisateur avec le même email
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      // Si l'utilisateur existe déjà, retourner un statut 400 avec un message d'erreur
      return res
        .status(400)
        .json({ msg: "Un utilisateur avec cette adresse e-mail existe déjà." });
    }

    // Hashage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création du nouvel utilisateur
    const newUser = await User.create({
      email,
      password: hashedPassword,
      ...rest,
    });

    // Création d'un token JWT pour l'envoi de l'email de confirmation
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    // Configuration du transporteur pour l'envoi d'emails
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USERNAME,
        pass: EMAIL_PASSWORD,
      },
    });

    // Options de l'email de confirmation
    const mailOptions = {
      from: EMAIL_USERNAME,
      to: newUser.email,
      subject: "Confirmation d'inscription",
      text: `Veuillez cliquer sur le lien suivant pour confirmer votre inscription: http://localhost:3000/api/users/confirm/${token}`,
    };

    // Envoi de l'email de confirmation
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        // Si une erreur se produit lors de l'envoi de l'email, retourner un statut 500 avec un message d'erreur
        console.log(error);
        res
          .status(500)
          .json({ msg: "Erreur lors de l'envoi de l'email de confirmation." });
      } else {
        // Si l'email est envoyé avec succès, retourner un statut 201 avec un message de succès
        res.status(201).json({
          msg: "Utilisateur enregistré. Veuillez vérifier votre e-mail pour confirmer l'inscription.",
        });
      }
    });
  } catch (err) {
    // En cas d'erreur lors de la création de l'utilisateur, retourner un statut 500 avec un message d'erreur
    console.error(err);
    res
      .status(500)
      .json({ msg: "Erreur lors de la création de l'utilisateur." });
  }
};

// Fonction pour se connecter (login)
exports.login = async (req, res) => {
  // Extraire l'e-mail et le mot de passe de la requête
  const { email, password } = req.body;

  try {
    // Chercher l'utilisateur avec l'e-mail fourni
    const user = await User.findOne({ where: { email } });

    // Si l'utilisateur n'existe pas, renvoyer une erreur 400
    if (!user) {
      return res
        .status(400)
        .json({ msg: "L'adresse e-mail ou le mot de passe est incorrect." });
    }

    // Vérifier si le mot de passe fourni est valide
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // Si le mot de passe est invalide, renvoyer une erreur 400
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ msg: "L'adresse e-mail ou le mot de passe est incorrect." });
    }

    // Créer un token JWT avec l'ID de l'utilisateur et une durée d'expiration de 24 heures
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    // Renvoyer le token et l'utilisateur avec un statut 200
    res.status(200).json({ token, user });
  } catch (err) {
    // Gérer les erreurs et renvoyer un statut 500
    console.error(err);
    res.status(500).json({ msg: "Erreur lors de la connexion." });
  }
};

// Fonction pour confirmer l'inscription d'un utilisateur
exports.confirm = async (req, res) => {
  try {
    // Vérifier le token JWT et extraire l'ID de l'utilisateur
    const { userId } = jwt.verify(req.params.token, JWT_SECRET);

    // Mettre à jour l'utilisateur avec l'ID extrait pour confirmer son inscription
    await User.update({ confirmed: true }, { where: { id: userId } });

    // Renvoyer un message de succès avec un statut 200
    res.status(200).json({ msg: "Inscription confirmée avec succès." });
  } catch (err) {
    // Gérer les erreurs et renvoyer un statut 500
    console.error(err);
    res
      .status(500)
      .json({ msg: "Erreur lors de la confirmation de l'inscription." });
  }
};

// Fonction pour mettre à jour le profil utilisateur
exports.updateProfile = async (req, res) => {
  // Extraire l'ID de l'utilisateur de la requête
  const userId = req.userId;
  // Extraire les mises à jour du corps de la requête
  const updates = req.body;
  try {
    // Trouver l'utilisateur par son ID
    const user = await User.findByPk(userId);

    // Si l'utilisateur n'existe pas, renvoyer une erreur 404
    if (!user) {
      return res.status(404).json({ msg: "Utilisateur introuvable." });
    }

    // Code pour la récupération du profil utilisateur
    // Renvoyer le profil de l'utilisateur avec un statut 200 (OK)
    res.status(200).json(user);
  } catch (err) {
    // Afficher l'erreur dans la console
    console.error(err);
    // Renvoyer un message d'erreur avec un statut 500 (Erreur interne du serveur)
    res.status(500).json({ msg: "Erreur lors de la récupération du profil." });
  }
};

// Fonction pour réinitialiser le mot de passe
exports.resetPassword = async (req, res) => {
  // Extraire l'email du corps de la requête
  const { email } = req.body;

  // Bloc try pour gérer les erreurs
  try {
    // Trouver l'utilisateur avec l'adresse e-mail fournie
    const user = await User.findOne({ where: { email } });

    // Si l'utilisateur n'est pas trouvé, renvoyer un message d'erreur avec un statut 404 (Non trouvé)
    if (!user) {
      return res
        .status(404)
        .json({ msg: "Aucun utilisateur trouvé avec cette adresse e-mail." });
    }

    // Générer un token JWT pour la réinitialisation du mot de passe
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // Configurer le transporteur d'email avec Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USERNAME,
        pass: EMAIL_PASSWORD,
      },
    });

    // Configurer les options d'email
    const mailOptions = {
      from: EMAIL_USERNAME,
      to: user.email,
      subject: "Réinitialisation du mot de passe",
      text: `Veuillez cliquer sur le lien suivant pour réinitialiser votre mot de passe: http://localhost:3000/api/users/reset-password/${token}`,
    };

    // Envoyer l'email avec le lien de réinitialisation du mot de passe
    transporter.sendMail(mailOptions, (error, info) => {
      // Si une erreur se produit lors de l'envoi de l'email, renvoyer un message d'erreur avec un statut 500 (Erreur interne du serveur)
      if (error) {
        console.log(error);
        res.status(500).json({
          msg: "Erreur lors de l'envoi de l'email de réinitialisation.",
        });
      } else {
        // Sinon, renvoyer un message de succès avec un statut 200 (OK)
        res.status(200).json({
          msg: "Veuillez vérifier votre e-mail pour réinitialiser votre mot de passe.",
        });
      }
    });
  } catch (err) {
    // Afficher l'erreur dans la console
    console.error(err);
    // Renvoyer un message d'erreur avec un statut 500 (Erreur interne du serveur)
    res
      .status(500)
      .json({ msg: "Erreur lors de la réinitialisation du mot de passe." });
  }
};

// Exporter les fonctions pour les utiliser dans d'autres fichiers
module.exports = exports;
