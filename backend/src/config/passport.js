const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma = require('../models/db');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'GOOGLE_ID_PLACEHOLDER',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'GOOGLE_SECRET_PLACEHOLDER',
    callbackURL: "/api/auth/google/callback",
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      
      // Upsert: Find existing user by email or googleId
      let user = await prisma.user.upsert({
        where: { email },
        update: {
            googleId: profile.id,
            name: profile.displayName,
            avatar: profile.photos[0]?.value,
        },
        create: {
          email,
          googleId: profile.id,
          name: profile.displayName,
          avatar: profile.photos[0]?.value,
          password: null, // Explicitly null for OAuth users
          role: 'user',
          subscription: 'free'
        }
      });
      
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// Serialization is needed for sessions if we use them
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
