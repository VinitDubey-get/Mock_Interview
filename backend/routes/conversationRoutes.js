// backend/routes/conversationRoutes.js

const express = require('express');
const {
  createConversation,
  addMessageToConversation,
  getConversationById,
  completeConversation,
  getMyConversations
} = require('../controllers/conversationController');

const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/create', protect, createConversation);
router.post('/:id/message', protect, addMessageToConversation);
router.get('/:id', protect, getConversationById);
router.post('/:id/complete', protect, completeConversation);
router.get('/my-conversations', protect, getMyConversations);

module.exports = router;