// backend/controllers/conversationController.js

const Conversation = require("../models/Conversation");
const Session = require("../models/Session");

// @desc Create a new conversation for a session
// @route POST/api/conversations/create
// @access private
exports.createConversation = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user._id;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    // Check if session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if conversation already exists for this session
    const existingConversation = await Conversation.findOne({ 
      session: sessionId, 
      user: userId,
      status: { $in: ['active', 'paused'] }
    });

    if (existingConversation) {
      return res.status(200).json({
        success: true,
        conversation: existingConversation
      });
    }

    // Create new conversation
    const conversation = await Conversation.create({
      session: sessionId,
      user: userId,
      messages: [],
      status: 'active'
    });

    res.status(201).json({
      success: true,
      conversation
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc Add message to conversation
// @route POST/api/conversations/:id/message
// @access private
exports.addMessageToConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      sender, 
      message, 
      feedback, 
      questionType, 
      difficulty 
    } = req.body;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const newMessage = {
      sender,
      message,
      feedback,
      questionType,
      difficulty,
      timestamp: new Date()
    };

    conversation.messages.push(newMessage);
    await conversation.save();

    res.status(200).json({
      success: true,
      conversation,
      newMessage
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc Get conversation by ID
// @route GET/api/conversations/:id
// @access private
exports.getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('session')
      .populate('user', '-password');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found"
      });
    }

    res.status(200).json({
      success: true,
      conversation
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// @desc Complete conversation with final feedback
// @route POST/api/conversations/:id/complete
// @access private
exports.completeConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { finalFeedback, duration } = req.body;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    conversation.status = 'completed';
    conversation.finalFeedback = finalFeedback;
    conversation.duration = duration;
    conversation.completedAt = new Date();
    
    await conversation.save();

    res.status(200).json({
      success: true,
      conversation
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// @desc Get all conversations for a user
// @route GET/api/conversations/my-conversations
// @access private
exports.getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ user: req.user._id })
      .populate('session', 'role experience topicsToFocus')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      conversations
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};