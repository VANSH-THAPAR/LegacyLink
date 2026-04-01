const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/authMiddleware');

router.get('/contacts', auth, chatController.getContacts);
router.get('/:userId', auth, chatController.getConversation);
router.post('/', auth, chatController.sendMessage);

module.exports = router;
