const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'secret_key_2026';

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(403).json({ status: 'error', message: 'No token provided' });
    }
    
    // Authorization: Bearer <token>
    const token = authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(403).json({ status: 'error', message: 'Malformed token' });
    }
    
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ status: 'error', message: 'Token expired or invalid' });
        }
        
        req.user = decoded; // { id, email, role }
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ status: 'error', message: 'Admin access required' });
    }
};

module.exports = { verifyToken, isAdmin };
