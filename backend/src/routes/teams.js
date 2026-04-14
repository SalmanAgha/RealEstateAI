const express = require('express');
const router = express.Router();
const { 
    createTeam, 
    addMember, 
    getUserTeams, 
    removeMember 
} = require('../controllers/teamController');
const { authenticateJWT, authorizeTeamRole } = require('../middleware/auth');

// All team routes require authentication
router.use(authenticateJWT);

// Get teams for current user
router.get('/', getUserTeams);

// Create a new team
router.post('/', createTeam);

// Add member to team (Requires OWNER or ADMIN role in the team)
router.post('/:teamId/members', authorizeTeamRole(['OWNER', 'ADMIN']), addMember);

// Remove member from team (Requires OWNER or ADMIN role in the team)
router.delete('/:teamId/members/:userId', authorizeTeamRole(['OWNER', 'ADMIN']), removeMember);

module.exports = router;
