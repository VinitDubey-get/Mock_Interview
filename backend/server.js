// backend/server.js - Updated version

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

const authRoutes = require('./routes/authRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const questionRoutes = require('./routes/questionRoutes');
const conversationRoutes = require('./routes/conversationRoutes'); // New route

const { protect } = require('./middlewares/authMiddleware');
const {
  generateConceptExplanation,
  generateInterviewQuestions,
  startConversationalInterview,
  continueConversationalInterview,
  endConversationalInterview
} = require('./controllers/aiController');

const app = express();

// middleware to handle cors
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

connectDB();

// middleware
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/conversations", conversationRoutes); // New route

// AI routes
app.use("/api/ai/generate-questions", protect, generateInterviewQuestions);
app.use("/api/ai/generate-explanation", protect, generateConceptExplanation);
app.use("/api/ai/start-conversation", protect, startConversationalInterview);
app.use("/api/ai/continue-conversation", protect, continueConversationalInterview);
app.use("/api/ai/end-conversation", protect, endConversationalInterview);

// serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {}));

// start server
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));