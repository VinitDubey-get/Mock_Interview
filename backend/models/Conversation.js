// backend/models/Conversation.js

const mongoose = require("mongoose");

const conversationMessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['interviewer', 'candidate'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  feedback: String,
  questionType: {
    type: String,
    enum: ['introduction', 'technical', 'behavioral', 'follow-up', 'clarification']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard']
  }
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active'
  },
  messages: [conversationMessageSchema],
  finalFeedback: {
    overallFeedback: String,
    strengths: [String],
    improvements: [String],
    score: String,
    recommendedActions: [String]
  },
  duration: Number, // in seconds
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
}, 
{
  timestamps: true
});

module.exports = mongoose.model("Conversation", conversationSchema);