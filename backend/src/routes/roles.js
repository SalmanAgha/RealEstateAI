const express = require('express');
const router = express.Router();
const { 
    getAllRoles, 
    createRole, 
    updateRole, 
    deleteRole 
} = require('../controllers/roleController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

// All role management requires admin privileges
router.use(authenticateJWT, authorizeRoles(['admin']));

router.get('/', getAllRoles);
router.post('/', createRole);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

module.exports = router;
