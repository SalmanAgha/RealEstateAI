const prisma = require('../models/db');

const updateSubscription = async (req, res) => {
    try {
        const { userId, type } = req.body;
        
        const validPlans = ['free', 'pro', 'enterprise'];
        
        if (!validPlans.includes(type)) {
            return res.status(400).json({ status: 'error', message: 'Invalid plan type' });
        }
        
        const user = await prisma.user.update({
            where: { id: userId },
            data: { subscription: type }
        });
        
        res.json({ status: 'success', message: `Subscription updated to ${type}` });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        console.error("Subscription update error:", error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
};

module.exports = { updateSubscription };
