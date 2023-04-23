// emailUtils.js
const transporter = require("./mailer");

async function sendConfirmationEmail(userEmail, confirmationToken) {
  const mailOptions = {
    from: "noreply@example.com", // L'adresse e-mail d'expédition
    to: userEmail, // L'adresse e-mail du destinataire (l'utilisateur)
    subject: "Confirmez votre inscription", // Le sujet de l'e-mail
    text: `Bienvenue ! Veuillez confirmer votre inscription en cliquant sur le lien suivant : https://your-domain.com/confirm/${confirmationToken}`, // Le contenu de l'e-mail en texte brut
    html: `<p>Bienvenue ! Veuillez confirmer votre inscription en cliquant sur le lien suivant : <a href="https://your-domain.com/confirm/${confirmationToken}">Confirmer mon inscription</a></p>`, // Le contenu de l'e-mail en HTML
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email: %s", error.message);
  }
}

module.exports = {
  sendConfirmationEmail,
};
