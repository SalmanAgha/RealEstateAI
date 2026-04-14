const prisma = require('../models/db');

/**
 * Log an activity to the database
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Action name (e.g. 'TEAM_CREATED')
 * @param {string|null} teamId - Associated team ID if applicable
 * @param {object|null} details - Additional details to store as JSON string
 */
const logActivity = async (userId, action, teamId = null, details = null) => {
    try {
        await prisma.activityLog.create({
            data: {
                userId,
                action,
                teamId,
                details: details ? JSON.stringify(details) : null
            }
        });
    } catch (error) {
        console.error('Critical: Failed to log activity:', error);
        // We don't throw here to avoid breaking the main application flow
    }
};

module.exports = { logActivity };
