const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('./config/passport');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Session and Passport for OAuth
app.use(session({
    secret: process.env.SESSION_SECRET || 'platform_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // In production, provide true with HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

// Mock Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// Auth Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/notifications', require('./routes/notifications'));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
