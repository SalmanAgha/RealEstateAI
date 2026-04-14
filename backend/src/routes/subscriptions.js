const express = require('express');
const router = express.Router();
const { updateSubscription } = require('../controllers/subscriptionController');
const { authenticateJWT } = require('../middleware/auth');

router.post('/update', authenticateJWT, updateSubscription);

module.exports = router;
