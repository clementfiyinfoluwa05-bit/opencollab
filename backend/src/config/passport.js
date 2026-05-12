const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./db');
const { createToken } = require('../controllers/authController');

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const name  = profile.displayName;
    const googleId = profile.id;

    const existing = await pool.query(
      'SELECT * FROM users WHERE google_id = $1 OR email = $2',
      [googleId, email]
    );

    let user;
    if (existing.rows.length > 0) {
      user = existing.rows[0];
      if (!user.google_id) {
        await pool.query(
          'UPDATE users SET google_id = $1 WHERE id = $2',
          [googleId, user.id]
        );
      }
    } else {
      const result = await pool.query(
        `INSERT INTO users (name, email, google_id)
         VALUES ($1, $2, $3) RETURNING *`,
        [name, email, googleId]
      );
      user = result.rows[0];
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

module.exports = passport;
