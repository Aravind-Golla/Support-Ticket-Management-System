const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authenticate');
const { requireRole } = require('../middleware/requireRole');

const router = express.Router();

router.get('/', authenticate, requireRole('agent'), userController.listAgents);

module.exports = router;
