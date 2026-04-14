const prisma = require('../models/db');

/**
 * Get all notifications for the current user
 */
const getNotifications = async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json({ status: 'success', data: notifications });
    } catch (error) {
        console.error("Get Notifications error:", error);
        res.status(500).json({ status: 'error', message: 'Failed to synchronize alerts' });
    }
};

/**
 * Mark a single notification as read
 */
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.notification.update({
            where: { id, userId: req.user.id },
            data: { isRead: true }
        });
        res.json({ status: 'success', message: 'Read status updated' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Update failed' });
    }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user.id, isRead: false },
            data: { isRead: true }
        });
        res.json({ status: 'success', message: 'Global read state updated' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Global update failed' });
    }
};

/**
 * Delete a notification
 */
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.notification.delete({
            where: { id, userId: req.user.id }
        });
        res.json({ status: 'success', message: 'Notification deprovisioned' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Deletion failed' });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
};
