const express = require('express');
const router = express.Router();
const { getProfile, getAllUsers, updateUser, deleteUser } = require('../controllers/userController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

router.get('/profile', authenticateJWT, getProfile);
router.get('/all', authenticateJWT, authorizeRoles(['admin']), getAllUsers);
router.post('/', authenticateJWT, authorizeRoles(['admin']), (req, res, next) => {
    // We'll define createUser in userController
    require('../controllers/userController').createUser(req, res);
});
router.put('/:id', authenticateJWT, authorizeRoles(['admin']), updateUser);
router.delete('/:id', authenticateJWT, authorizeRoles(['admin']), deleteUser);

module.exports = router;
