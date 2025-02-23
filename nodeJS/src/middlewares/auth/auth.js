const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const UserModel = require('../../models/Employee');

passport.use(
  "signup",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true, // Permet d'accéder à `req.body`
    },
    async (req, email, password, done) => {
      try {
        const { role } = req.body

        if (!role) {
          return done(null, false, { message: "Le rôle est obligatoire" })
        }

        const user = await UserModel.create({
          email,
          password,
          role, // Rôle fourni dans la requête
        })

        return done(null, user)
      } catch (error) {
        done(error)
      }
    }
  )
)
  passport.use(
    'login',
    new localStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        try {
          const user = await UserModel.findOne({ email });
  
          if (!user) {
            return done(null, false, { message: 'User not found' });
          }
  
          const validate = await user.isValidPassword(password);
  
          if (!validate) {
            return done(null, false, { message: 'Wrong Password' });
          }
  
          return done(null, user, { message: 'Logged in Successfully' });
        } catch (error) {
          return done(error);
        }
      }
    )
  );