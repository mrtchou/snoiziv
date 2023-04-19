const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

module.exports = function (passport, getUserByEmail, getUserById) {
  // Stratégie locale pour l'authentification par email et mot de passe
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        const user = await getUserByEmail(email);
        if (!user) {
          return done(null, false, {
            message: "Aucun utilisateur avec cet email",
          });
        }

        try {
          if (await bcrypt.compare(password, user.password)) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Mot de passe incorrect" });
          }
        } catch (e) {
          return done(e);
        }
      }
    )
  );

  // Sérialisation et désérialisation de l'utilisateur pour gérer les sessions
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await getUserById(id);
    return user ? done(null, user) : done(new Error("Utilisateur non trouvé"));
  });
};
