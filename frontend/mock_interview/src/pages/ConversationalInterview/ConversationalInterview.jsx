// frontend/src/pages/ConversationalInterview/ConversationalInterview.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  LuMic, 
  LuMicOff, 
  LuVolume2, 
  LuVolumeX, 
  LuPlay, 
  LuPause, 
  LuSquare,
  LuMessageCircle,
  LuClock,
  LuUser,
  LuBot
} from 'react-icons/lu';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPath';
import { SpeechRecognitionService, TextToSpeechService } from '../../utils/speechUtils';
import ConversationMessage from './components/ConversationMessage';
import AudioVisualization from './components/AudioVisualization';
import SpinnerLoader from '../../components/Loader/SpinnerLoader';

const ConversationalInterview = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [sessionData, setSessionData] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [interviewDuration, setInterviewDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Refs
  const speechRecognition = useRef(new SpeechRecognitionService());
  const textToSpeech = useRef(new TextToSpeechService());
  const messagesEndRef = useRef(null);
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Timer functions
  const startTimer = () => {
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setInterviewDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Format duration for display
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch session data
  const fetchSessionData = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.SESSION.GET_ONE(sessionId));
      if (response.data?.message) {
        setSessionData(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      toast.error('Failed to load session data');
      navigate('/dashboard');
    }
  };

  // Create or get existing conversation
  const initializeConversation = async () => {
    try {
      const response = await axiosInstance.post(API_PATHS.CONVERSATION.CREATE, {
        sessionId
      });
      
      if (response.data?.conversation) {
        setConversation(response.data.conversation);
        setMessages(response.data.conversation.messages || []);
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
      toast.error('Failed to initialize conversation');
    }
  };

  // Start the interview
  const startInterview = async () => {
    if (!sessionData) return;
    
    setIsProcessing(true);
    try {
      const response = await axiosInstance.post(API_PATHS.AI.START_CONVERSATION, {
        role: sessionData.role,
        experience: sessionData.experience,
        topicsToFocus: sessionData.topicsToFocus
      });

      if (response.data) {
        const newMessage = {
          sender: 'interviewer',
          message: response.data.message,
          questionType: response.data.questionType,
          difficulty: response.data.difficulty,
          timestamp: new Date()
        };

        // Add message to conversation
        await addMessageToConversation(newMessage);
        setMessages(prev => [...prev, newMessage]);
        setIsInterviewStarted(true);
        startTimer();

        // Speak the first message if audio is enabled
        if (audioEnabled) {
          await textToSpeech.current.speak(response.data.message);
        }
      }
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error('Failed to start interview');
    } finally {
      setIsProcessing(false);
    }
  };

  // Add message to conversation in database
  const addMessageToConversation = async (messageData) => {
    if (!conversation) return;
    
    try {
      await axiosInstance.post(API_PATHS.CONVERSATION.ADD_MESSAGE(conversation._id), messageData);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  // Continue conversation with user response
  const continueConversation = async (userResponse) => {
    if (!sessionData || !userResponse.trim()) return;
    
    setIsProcessing(true);
    
    // Add user message
    const userMessage = {
      sender: 'candidate',
      message: userResponse,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    await addMessageToConversation(userMessage);
    
    try {
      const response = await axiosInstance.post(API_PATHS.AI.CONTINUE_CONVERSATION, {
        role: sessionData.role,
        experience: sessionData.experience,
        topicsToFocus: sessionData.topicsToFocus,
        conversationHistory: messages,
        userResponse
      });

      if (response.data) {
        const interviewerMessage = {
          sender: 'interviewer',
          message: response.data.message,
          feedback: response.data.feedback,
          questionType: response.data.questionType,
          difficulty: response.data.difficulty,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, interviewerMessage]);
        await addMessageToConversation(interviewerMessage);

        // Speak the response if audio is enabled
        if (audioEnabled) {
          setIsSpeaking(true);
          await textToSpeech.current.speak(response.data.message);
          setIsSpeaking(false);
        }
      }
    } catch (error) {
      console.error('Error continuing conversation:', error);
      toast.error('Failed to get response');
    } finally {
      setIsProcessing(false);
    }
  };

  // End interview and get feedback
  const endInterview = async () => {
    if (!sessionData) return;
    
    setIsProcessing(true);
    stopTimer();
    
    try {
      const response = await axiosInstance.post(API_PATHS.AI.END_CONVERSATION, {
        role: sessionData.role,
        experience: sessionData.experience,
        topicsToFocus: sessionData.topicsToFocus,
        conversationHistory: messages
      });

      if (response.data && conversation) {
        // Complete conversation in database
        await axiosInstance.post(API_PATHS.CONVERSATION.COMPLETE(conversation._id), {
          finalFeedback: response.data,
          duration: interviewDuration
        });

        // Add final feedback message
        const finalMessage = {
          sender: 'interviewer',
          message: response.data.message,
          timestamp: new Date(),
          isFinal: true
        };
        
        setMessages(prev => [...prev, finalMessage]);
        
        if (audioEnabled) {
          await textToSpeech.current.speak(response.data.message);
        }
        
        setIsInterviewStarted(false);
        toast.success('Interview completed! Check your feedback below.');
      }
    } catch (error) {
      console.error('Error ending interview:', error);
      toast.error('Failed to end interview');
    } finally {
      setIsProcessing(false);
    }
  };

  // Speech recognition handlers
  const startListening = async () => {
    if (!speechRecognition.current.isSupported) {
      toast.error('Speech recognition not supported in your browser');
      return;
    }

    try {
      setIsListening(true);
      setCurrentTranscript('');
      
      await speechRecognition.current.startListening(
        (result) => {
          setCurrentTranscript(result.final + result.interim);
        },
        (error) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
          toast.error('Speech recognition failed');
        },
        () => {
          setIsListening(false);
          if (currentTranscript.trim()) {
            continueConversation(currentTranscript.trim());
            setCurrentTranscript('');
          }
        }
      );
    } catch (error) {
      setIsListening(false);
      toast.error('Failed to start listening');
    }
  };

  const stopListening = () => {
    speechRecognition.current.stopListening();
    setIsListening(false);
  };

  // Toggle audio
  const toggleAudio = () => {
    if (isSpeaking) {
      textToSpeech.current.stop();
      setIsSpeaking(false);
    }
    setAudioEnabled(!audioEnabled);
  };

  // Manual text input
  const handleManualInput = (text) => {
    if (text.trim()) {
      continueConversation(text.trim());
    }
  };

  // Initialize
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await fetchSessionData();
      await initializeConversation();
      setIsLoading(false);
    };
    
    if (sessionId) {
      initialize();
    }

    // Cleanup
    return () => {
      stopTimer();
      textToSpeech.current.stop();
      speechRecognition.current.stopListening();
    };
  }, [sessionId]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <SpinnerLoader />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Conversational Interview
                </h1>
                <p className="text-sm text-gray-600">
                  {sessionData?.role} • {sessionData?.experience} years experience
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Timer */}
                {isInterviewStarted && (
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <LuClock className="text-blue-500" />
                    {formatDuration(interviewDuration)}
                  </div>
                )}
                
                {/* Audio Toggle */}
                <button
                  onClick={toggleAudio}
                  className={`p-2 rounded-lg border ${
                    audioEnabled 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  {audioEnabled ? <LuVolume2 /> : <LuVolumeX />}
                </button>
                
                {/* End Interview */}
                {isInterviewStarted && (
                  <button
                    onClick={endInterview}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    End Interview
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          {!isInterviewStarted ? (
            /* Start Interview Screen */
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LuMessageCircle className="text-2xl text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Ready for your interview?
                  </h2>
                  <p className="text-gray-600">
                    This will be a conversational interview where you'll interact with an AI interviewer. 
                    You can respond using voice or text input.
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3 text-left">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-semibold text-green-600">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Voice Interaction</p>
                      <p className="text-sm text-gray-600">Click the microphone to speak your answers</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 text-left">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-semibold text-green-600">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Audio Feedback</p>
                      <p className="text-sm text-gray-600">The interviewer will speak to you (can be toggled)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 text-left">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-semibold text-green-600">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Real-time Conversation</p>
                      <p className="text-sm text-gray-600">Natural back-and-forth conversation flow</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={startInterview}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing && <SpinnerLoader />}
                  Start Interview
                </button>
              </div>
            </div>
          ) : (
            /* Interview Screen */
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Messages */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-lg h-[600px] flex flex-col">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold text-gray-900">Conversation</h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((message, index) => (
                        <ConversationMessage
                          key={index}
                          message={message}
                          isUser={message.sender === 'candidate'}
                        />
                      ))}
                      
                      {isProcessing && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <LuBot className="text-blue-500" />
                          <span className="text-sm">Interviewer is thinking...</span>
                          <SpinnerLoader />
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="space-y-6">
                  {/* Voice Control */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Voice Control</h3>
                    
                    <div className="text-center space-y-4">
                      {/* Microphone Button */}
                      <button
                        onClick={isListening ? stopListening : startListening}
                        disabled={isProcessing}
                        className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${
                          isListening
                            ? 'bg-red-500 border-red-300 text-white animate-pulse'
                            : 'bg-blue-500 border-blue-300 text-white hover:bg-blue-600'
                        } disabled:opacity-50`}
                      >
                        {isListening ? <LuMicOff className="text-2xl" /> : <LuMic className="text-2xl" />}
                      </button>
                      
                      <p className="text-sm text-gray-600">
                        {isListening ? 'Listening... Click to stop' : 'Click to speak'}
                      </p>
                      
                      {/* Current Transcript */}
                      {currentTranscript && (
                        <div className="bg-gray-50 p-3 rounded-lg border">
                          <p className="text-sm text-gray-700">{currentTranscript}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Audio Visualization */}
                    <AudioVisualization isListening={isListening} />
                  </div>

                  {/* Text Input Alternative */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Text Input</h3>
                    <ManualTextInput 
                      onSubmit={handleManualInput}
                      disabled={isProcessing}
                    />
                  </div>

                  {/* Interview Stats */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Interview Progress</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{formatDuration(interviewDuration)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Questions:</span>
                        <span className="font-medium">
                          {messages.filter(m => m.sender === 'interviewer').length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Your Responses:</span>
                        <span className="font-medium">
                          {messages.filter(m => m.sender === 'candidate').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

// Manual Text Input Component
const ManualTextInput = ({ onSubmit, disabled }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your response here..."
        disabled={disabled}
        rows={4}
        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-900 disabled:opacity-50"
      >
        Send Response
      </button>
    </form>
  );
};

export default ConversationalInterview;