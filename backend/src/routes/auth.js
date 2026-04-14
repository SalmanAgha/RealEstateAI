const express = require('express');
const router = express.Router();
const { login, signup } = require('../controllers/authController');

const passport = require('passport');
const jwt = require('jsonwebtoken');

router.post('/login', login);
router.post('/signup', signup);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    // Generate JWT for the authenticated user
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, role: req.user.role },
      process.env.ACCESS_TOKEN_SECRET || 'secret_key_2026',
      { expiresIn: '1h' }
    );

    // Redirect to the frontend with the token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const userEncoded = encodeURIComponent(JSON.stringify(req.user));
    res.redirect(`${frontendUrl}/login?token=${token}&user=${userEncoded}`);
  }
);

router.post('/logout', (req, res) => {
    // In JWT, logout is usually handled on client side (removing token)
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;
