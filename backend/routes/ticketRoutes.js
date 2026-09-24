const express = require('express');
const ticketController = require('../controllers/ticketController');
const commentController = require('../controllers/commentController');
const { authenticate } = require('../middleware/authenticate');
const { requireRole } = require('../middleware/requireRole');

const router = express.Router();

router.use(authenticate);

router.get('/reports/open', requireRole('agent'), ticketController.openReport);
router.get('/', ticketController.list);
router.post('/', ticketController.create);
router.get('/:id/comments', commentController.list);
router.post('/:id/comments', commentController.create);
router.get('/:id', ticketController.getById);
router.put('/:id', requireRole('agent'), ticketController.update);
router.delete('/:id', ticketController.remove);

module.exports = router;
