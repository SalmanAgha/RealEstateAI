const prisma = require('../models/db');

const getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });
        
        if (user) {
            const { password, ...userWithoutPassword } = user;
            res.json({ status: 'success', data: userWithoutPassword });
        } else {
            res.status(404).json({ status: 'error', message: 'User not found' });
        }
    } catch (error) {
        console.error("Profile error:", error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        const allUsers = users.map(u => {
            const { password, ...userWithoutPassword } = u;
            return userWithoutPassword;
        });
        res.json({ status: 'success', data: allUsers });
    } catch (error) {
        console.error("GetAllUsers error:", error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role, subscription, status } = req.body;
    try {
        const updated = await prisma.user.update({
            where: { id },
            data: { name, email, role, subscription, status }
        });
        const { password, ...userWithoutPassword } = updated;
        res.json({ status: 'success', data: userWithoutPassword });
    } catch (error) {
        console.error("UpdateUser error:", error);
        res.status(500).json({ status: 'error', message: 'Update failed' });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({ where: { id } });
        res.json({ status: 'success', message: 'User deleted' });
    } catch (error) {
        console.error("DeleteUser error:", error);
        res.status(500).json({ status: 'error', message: 'Delete failed' });
    }
};

const bcrypt = require('bcryptjs');

// ... (other functions)

const createUser = async (req, res) => {
    try {
        const { name, email, password: userPassword, role, subscription } = req.body;
        
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ status: 'error', message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userPassword || 'password123', salt);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'user',
                subscription: subscription || 'free',
                status: 'active'
            }
        });

        const { password, ...userWithoutPassword } = newUser;
        res.status(201).json({ status: 'success', data: userWithoutPassword });
    } catch (error) {
        console.error("CreateUser error:", error);
        res.status(500).json({ status: 'error', message: 'Creation failed' });
    }
};

module.exports = { getProfile, getAllUsers, updateUser, deleteUser, createUser };
