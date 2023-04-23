// mailer.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.example.com", // Remplacez par le nom d'hôte de votre serveur SMTP
  port: 587,
  secure: false, // Utilisez true si le port est 465, sinon false
  auth: {
    user: "your-email@example.com", // Votre adresse e-mail
    pass: "your-email-password", // Votre mot de passe e-mail
  },
});

module.exports = transporter;
