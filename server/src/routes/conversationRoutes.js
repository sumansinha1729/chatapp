const express = require('express');
const {
  getOrCreateConversation,
  getConversationMessages,
  getUserConversations
} = require('../controllers/conversationController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getUserConversations);
router.post('/', getOrCreateConversation);
router.get('/:conversationId/messages', getConversationMessages);

module.exports = router;
