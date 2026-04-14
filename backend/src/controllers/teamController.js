const prisma = require('../models/db');
const { logActivity } = require('../utils/logger');

/**
 * Create a new team
 */
const createTeam = async (req, res) => {
    try {
        const { name, description, memberEmail } = req.body;
        const userId = req.user.id; 

        // Initial members always include the creator as OWNER
        const initialMembers = [
            { userId: userId, role: 'OWNER' }
        ];

        // If extra member email provided, look them up and add as MEMBER
        if (memberEmail) {
            const extraUser = await prisma.user.findUnique({ where: { email: memberEmail } });
            if (extraUser && extraUser.id !== userId) {
                initialMembers.push({ userId: extraUser.id, role: 'MEMBER' });
            }
        }

        const team = await prisma.team.create({
            data: {
                name,
                description,
                members: {
                    create: initialMembers
                }
            },
            include: {
                members: true
            }
        });

        // Log the activity
        await logActivity(userId, 'TEAM_CREATED', team.id, { name: team.name, addedMember: memberEmail || 'none' });

        res.status(201).json({ status: 'success', data: team });
    } catch (error) {
        console.error("Create Team error:", error);
        res.status(500).json({ status: 'error', message: 'Failed to create team' });
    }
};

/**
 * Add a member to a team
 */
const addMember = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { email, role } = req.body; // Add user by email

        const userToAdd = await prisma.user.findUnique({ where: { email } });
        if (!userToAdd) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        const teamMember = await prisma.teamMember.create({
            data: {
                teamId,
                userId: userToAdd.id,
                role: role || 'MEMBER'
            }
        });

        // Log the activity
        await logActivity(req.user.id, 'MEMBER_ADDED', teamId, { memberId: userToAdd.id, role: role || 'MEMBER' });

        res.status(201).json({ status: 'success', data: teamMember });
    } catch (error) {
        console.error("Add Member error:", error);
        res.status(500).json({ status: 'error', message: 'Failed to add member' });
    }
};

/**
 * List all teams the current user is part of
 */
const getUserTeams = async (req, res) => {
    try {
        const userId = req.user.id;

        const teams = await prisma.team.findMany({
            where: {
                members: {
                    some: { userId }
                }
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, avatar: true }
                        }
                    }
                }
            }
        });

        res.json({ status: 'success', data: teams });
    } catch (error) {
        console.error("Get User Teams error:", error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch teams' });
    }
};

/**
 * Remove a member from a team
 */
const removeMember = async (req, res) => {
    try {
        const { teamId, userId } = req.params;

        // Check if removing self (leave team) or authorized to remove others
        // The middleware should have checked permissions for non-self removal

        await prisma.teamMember.delete({
            where: {
                teamId_userId: { teamId, userId }
            }
        });

        res.json({ status: 'success', message: 'Member removed successfully' });
    } catch (error) {
        console.error("Remove Member error:", error);
        res.status(500).json({ status: 'error', message: 'Failed to remove member' });
    }
};

module.exports = {
    createTeam,
    addMember,
    getUserTeams,
    removeMember
};
