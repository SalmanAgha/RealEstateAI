const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../models/db');
const { logActivity } = require('../utils/logger');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'secret_key_2026';

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`Login attempt for: ${email}`);
        
        const user = await prisma.user.findUnique({ where: { email } });
        
        if (!user) {
            console.log(`User not found: ${email}`);
            return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`Password match for ${email}: ${isMatch}`);

        if (isMatch) {
            const accessToken = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                ACCESS_TOKEN_SECRET,
                { expiresIn: '24h' }
            );
            
            // Log the activity
            await logActivity(user.id, 'USER_LOGIN', null, { method: 'password' });

            const { password: _, ...userWithoutPassword } = user;
            
            res.json({
                status: 'success',
                token: accessToken,
                user: userWithoutPassword
            });
        } else {
            res.status(401).json({ status: 'error', message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

const signup = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ status: 'error', message: 'User already exists' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: 'user',
                subscription: 'free'
            }
        });
        
        res.status(201).json({ status: 'success', message: 'User created successfully' });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

module.exports = { login, signup };
