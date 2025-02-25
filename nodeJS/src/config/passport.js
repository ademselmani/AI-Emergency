// config/passport.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/employee.model");

// Configure Google OAuth2 Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // Google Client ID from environment variables
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Google Client Secret from environment variables
      callbackURL: "http://localhost:3000/api/auth/google/callback", // Callback URL after Google authentication
      scope: ["profile", "email"], // Request profile and email from Google
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the Google profile contains an email
        if (!profile.emails || profile.emails.length === 0) {
          throw new Error("Aucune adresse email trouvée dans le profil Google.");
        }

         const email = profile.emails[0].value;

         let user = await User.findOne({ email });

        
        // Return the user object to Passport
        return done(null, user);
      } catch (err) {
        // Handle any errors that occur during the process
        console.error("Erreur lors de l'authentification Google :", err);
        return done(err, null);
      }
    }
  )
);

// Serialize user object to store in the session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user object from the session
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Export the configured passport instance
module.exports = passport;