// frontend/src/pages/ConversationalInterview/components/ConversationMessage.jsx

import React from 'react';
import { LuUser, LuBot, LuClock, LuTrendingUp } from 'react-icons/lu';
import moment from 'moment';

const ConversationMessage = ({ message, isUser }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'technical':
        return '💻';
      case 'behavioral':
        return '🧠';
      case 'introduction':
        return '👋';
      case 'follow-up':
        return '🔄';
      default:
        return '💬';
    }
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-100 text-gray-600'
      }`}>
        {isUser ? <LuUser size={16} /> : <LuBot size={16} />}
      </div>

      {/* Message Content */}
      <div className={`max-w-[70%] ${isUser ? 'text-right' : 'text-left'}`}>
        {/* Message Bubble */}
        <div className={`inline-block p-4 rounded-2xl ${
          isUser 
            ? 'bg-blue-500 text-white rounded-br-md' 
            : 'bg-white border border-gray-200 rounded-bl-md shadow-sm'
        }`}>
          <p className={`text-sm leading-relaxed ${
            isUser ? 'text-white' : 'text-gray-900'
          }`}>
            {message.message}
          </p>
          
          {/* Feedback for interviewer messages */}
          {!isUser && message.feedback && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-600 italic">
                💡 {message.feedback}
              </p>
            </div>
          )}
        </div>

        {/* Message Metadata */}
        <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
          isUser ? 'justify-end' : 'justify-start'
        }`}>
          {/* Timestamp */}
          <div className="flex items-center gap-1">
            <LuClock size={12} />
            <span>{moment(message.timestamp).format('HH:mm')}</span>
          </div>
          
          {/* Question Type and Difficulty (for interviewer messages) */}
          {!isUser && (message.questionType || message.difficulty) && (
            <>
              {message.questionType && (
                <div className="flex items-center gap-1">
                  <span>{getQuestionTypeIcon(message.questionType)}</span>
                  <span className="capitalize">{message.questionType}</span>
                </div>
              )}
              
              {message.difficulty && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  getDifficultyColor(message.difficulty)
                }`}>
                  {message.difficulty}
                </span>
              )}
            </>
          )}
        </div>

        {/* Final Feedback Display */}
        {!isUser && message.isFinal && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <LuTrendingUp className="text-blue-600" />
              <h4 className="font-semibold text-blue-900">Interview Summary</h4>
            </div>
            
            {/* This would be populated from the final feedback object */}
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Overall Performance:</strong> Great job on technical concepts!</p>
              <p><strong>Areas of Strength:</strong> Problem-solving, Communication</p>
              <p><strong>Areas for Improvement:</strong> System design depth</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationMessage;