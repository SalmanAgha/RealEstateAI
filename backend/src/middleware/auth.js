const jwt = require('jsonwebtoken');
const prisma = require('../models/db');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'secret_key_2026';

/**
 * Middleware to authenticate requests using JWT
 */
const authenticateJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, ACCESS_TOKEN_SECRET, async (err, payload) => {
            if (err) {
                return res.status(403).json({ status: 'error', message: 'Invalid or expired token' });
            }

            try {
                // Fetch the latest user data from DB (optional but recommended for role checks)
                const user = await prisma.user.findUnique({
                    where: { id: payload.id },
                    include: {
                        teamMemberships: {
                            include: { team: true }
                        }
                    }
                });

                if (!user) {
                    return res.status(404).json({ status: 'error', message: 'User not found' });
                }

                req.user = user;
                next();
            } catch (error) {
                return res.status(500).json({ status: 'error', message: 'Internal server error during authentication' });
            }
        });
    } else {
        res.status(401).json({ status: 'error', message: 'Authorization header missing' });
    }
};

/**
 * Middleware to authorize users based on global roles
 * @param {Array} roles - Allowed roles (e.g., ['admin', 'teamlead'])
 */
const authorizeRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ status: 'error', message: 'User not authenticated' });
        }

        if (roles.includes(req.user.role)) {
            next();
        } else {
            res.status(403).json({ status: 'error', message: 'Access denied: Insufficient permissions' });
        }
    };
};

/**
 * Middleware to authorize users based on team-specific roles
 * @param {Array} roles - Allowed team roles (e.g., ['OWNER', 'ADMIN'])
 */
const authorizeTeamRole = (roles) => {
    return (req, res, next) => {
        const teamId = req.params.teamId || req.body.teamId;

        if (!teamId) {
            return res.status(400).json({ status: 'error', message: 'Team ID is required' });
        }

        const membership = req.user.teamMemberships.find(m => m.teamId === teamId);

        if (membership && roles.includes(membership.role)) {
            next();
        } else {
            res.status(403).json({ status: 'error', message: 'Access denied: You do not have the required role in this team' });
        }
    };
};

module.exports = {
    authenticateJWT,
    authorizeRoles,
    authorizeTeamRole
};
