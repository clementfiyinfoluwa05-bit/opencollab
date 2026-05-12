const router = require('express').Router();
const { register, login, createToken } = require('../controllers/authController');
const rateLimit = require('express-rate-limit');
const passport = require('../config/passport');

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Too many registration attempts. Try again in an hour.' }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' }
});

router.post('/register', registerLimiter, register);
router.post('/login',    loginLimiter,    login);

// Google OAuth — Step 1: redirect user to Google
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

// Google OAuth — Step 2: Google redirects back here
router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed`
  }),
  (req, res) => {
    const token = createToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

module.exports = router;