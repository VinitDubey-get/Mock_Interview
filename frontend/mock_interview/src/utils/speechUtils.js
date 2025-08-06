// frontend/src/utils/speechUtils.js

export class SpeechRecognitionService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.isSupported = false;
    this.finalTranscript = '';
    this.interimTranscript = '';
    
    // Check browser support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.isSupported = true;
      
      // Configure recognition settings
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }

  // Start listening for speech
  startListening(onResult, onError, onEnd) {
    if (!this.isSupported) {
      const error = new Error('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
      if (onError) onError(error);
      return Promise.reject(error);
    }

    if (this.isListening) {
      const error = new Error('Already listening');
      if (onError) onError(error);
      return Promise.reject(error);
    }

    return new Promise((resolve, reject) => {
      this.finalTranscript = '';
      this.interimTranscript = '';

      // Handle speech recognition results
      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            this.finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        this.interimTranscript = interimTranscript;
        
        // Call the result callback
        if (onResult) {
          onResult({
            final: this.finalTranscript,
            interim: interimTranscript,
            isFinal: finalTranscript.length > 0,
            confidence: event.results[event.results.length - 1]?.[0]?.confidence || 0
          });
        }
      };

      // Handle errors
      this.recognition.onerror = (event) => {
        this.isListening = false;
        let errorMessage = `Speech recognition error: ${event.error}`;
        
        // Provide user-friendly error messages
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Please try speaking again.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not found. Please check your microphone connection.';
            break;
          case 'network':
            errorMessage = 'Network error occurred. Please check your internet connection.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service not available. Please try again later.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}. Please try again.`;
        }
        
        const error = new Error(errorMessage);
        if (onError) onError(error);
        reject(error);
      };

      // Handle end of recognition
      this.recognition.onend = () => {
        this.isListening = false;
        if (onEnd) onEnd();
        resolve(this.finalTranscript);
      };

      // Handle start of recognition
      this.recognition.onstart = () => {
        this.isListening = true;
      };

      // Handle no match
      this.recognition.onnomatch = () => {
        console.log('No speech match found');
      };

      // Start the recognition
      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        const wrappedError = new Error(`Failed to start speech recognition: ${error.message}`);
        if (onError) onError(wrappedError);
        reject(wrappedError);
      }
    });
  }

  // Stop listening
  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  }

  // Abort listening (immediate stop)
  abort() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.abort();
        this.isListening = false;
      } catch (error) {
        console.error('Error aborting speech recognition:', error);
      }
    }
  }

  // Check if currently listening
  isCurrentlyListening() {
    return this.isListening;
  }

  // Check if speech recognition is supported
  isSpeechRecognitionSupported() {
    return this.isSupported;
  }

  // Get final transcript
  getFinalTranscript() {
    return this.finalTranscript;
  }

  // Get interim transcript
  getInterimTranscript() {
    return this.interimTranscript;
  }
}

export class TextToSpeechService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.isSupported = 'speechSynthesis' in window;
    this.currentUtterance = null;
    this.isSpeaking = false;
    this.isPaused = false;
    this.voices = [];
    this.selectedVoice = null;
    
    // Load available voices
    this.loadVoices();
    
    // Handle voices changed event (some browsers load voices asynchronously)
    if (this.isSupported) {
      this.synth.addEventListener('voiceschanged', () => {
        this.loadVoices();
      });
    }
  }

  // Load available voices
  loadVoices() {
    if (!this.isSupported) return;
    
    this.voices = this.synth.getVoices();
    
    // Try to select the best voice for interviewer (prefer female, English)
    const preferredVoices = [
      'Google UK English Female',
      'Microsoft Zira Desktop',
      'Samantha',
      'Karen',
      'Victoria',
      'Fiona'
    ];
    
    for (const voiceName of preferredVoices) {
      const voice = this.voices.find(v => v.name.includes(voiceName));
      if (voice) {
        this.selectedVoice = voice;
        break;
      }
    }
    
    // Fallback to any English female voice
    if (!this.selectedVoice) {
      this.selectedVoice = this.voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.toLowerCase().includes('female') || 
         voice.name.toLowerCase().includes('woman'))
      );
    }
    
    // Final fallback to any English voice
    if (!this.selectedVoice) {
      this.selectedVoice = this.voices.find(voice => voice.lang.startsWith('en'));
    }
  }

  // Speak text
  speak(text, options = {}) {
    if (!this.isSupported) {
      return Promise.reject(new Error('Text-to-speech not supported in this browser'));
    }

    if (!text || text.trim() === '') {
      return Promise.reject(new Error('No text provided'));
    }

    // Stop any current speech
    this.stop();

    return new Promise((resolve, reject) => {
      // Create speech utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice settings
      utterance.rate = options.rate || 0.85; // Slightly slower for clarity
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 0.8;
      utterance.lang = options.lang || 'en-US';
      
      // Set voice
      if (options.voice) {
        utterance.voice = options.voice;
      } else if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }

      // Event handlers
      utterance.onstart = () => {
        this.isSpeaking = true;
        this.isPaused = false;
        if (options.onStart) options.onStart();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentUtterance = null;
        if (options.onEnd) options.onEnd();
        resolve();
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentUtterance = null;
        
        let errorMessage = `Speech synthesis error: ${event.error}`;
        switch (event.error) {
          case 'canceled':
            errorMessage = 'Speech was canceled';
            break;
          case 'not-allowed':
            errorMessage = 'Speech synthesis not allowed';
            break;
          case 'synthesis-failed':
            errorMessage = 'Speech synthesis failed. Please try again.';
            break;
          default:
            errorMessage = `Speech synthesis error: ${event.error}`;
        }
        
        const error = new Error(errorMessage);
        if (options.onError) options.onError(error);
        reject(error);
      };

      utterance.onpause = () => {
        this.isPaused = true;
        if (options.onPause) options.onPause();
      };

      utterance.onresume = () => {
        this.isPaused = false;
        if (options.onResume) options.onResume();
      };

      utterance.onboundary = (event) => {
        if (options.onBoundary) options.onBoundary(event);
      };

      // Store current utterance
      this.currentUtterance = utterance;
      
      try {
        // Start speaking
        this.synth.speak(utterance);
      } catch (error) {
        this.isSpeaking = false;
        this.currentUtterance = null;
        reject(new Error(`Failed to start speech synthesis: ${error.message}`));
      }
    });
  }

  // Stop speaking
  stop() {
    if (this.synth && this.isSpeaking) {
      try {
        this.synth.cancel();
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentUtterance = null;
      } catch (error) {
        console.error('Error stopping speech synthesis:', error);
      }
    }
  }

  // Pause speaking
  pause() {
    if (this.synth && this.isSpeaking && !this.isPaused) {
      try {
        this.synth.pause();
        this.isPaused = true;
      } catch (error) {
        console.error('Error pausing speech synthesis:', error);
      }
    }
  }

  // Resume speaking
  resume() {
    if (this.synth && this.isPaused) {
      try {
        this.synth.resume();
        this.isPaused = false;
      } catch (error) {
        console.error('Error resuming speech synthesis:', error);
      }
    }
  }

  // Check if currently speaking
  isCurrentlySpeaking() {
    return this.isSpeaking;
  }

  // Check if paused
  isCurrentlyPaused() {
    return this.isPaused;
  }

  // Check if text-to-speech is supported
  isTextToSpeechSupported() {
    return this.isSupported;
  }

  // Get available voices
  getAvailableVoices() {
    return this.voices;
  }

  // Set voice
  setVoice(voice) {
    if (this.voices.includes(voice)) {
      this.selectedVoice = voice;
      return true;
    }
    return false;
  }

  // Get current voice
  getCurrentVoice() {
    return this.selectedVoice;
  }
}

// Audio level visualization utility
export class AudioVisualization {
  constructor(canvasRef) {
    this.canvas = canvasRef?.current || canvasRef;
    this.ctx = this.canvas?.getContext('2d');
    this.analyser = null;
    this.dataArray = null;
    this.animationId = null;
    this.mediaStream = null;
    this.audioContext = null;
    this.isInitialized = false;
  }

  // Initialize audio visualization
  async initialize() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Media devices not supported in this browser');
    }

    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });
      
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create media stream source
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      // Create analyser
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      this.analyser.minDecibels = -90;
      this.analyser.maxDecibels = -10;
      
      // Connect source to analyser
      source.connect(this.analyser);
      
      // Create data array
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      
      this.isInitialized = true;
      return this.mediaStream;
      
    } catch (error) {
      console.error('Error initializing audio visualization:', error);
      throw new Error(`Failed to access microphone: ${error.message}`);
    }
  }

  // Start visualization
  startVisualization() {
    if (!this.canvas || !this.ctx || !this.analyser || !this.isInitialized) {
      console.warn('Audio visualization not properly initialized');
      return;
    }

    const draw = () => {
      this.animationId = requestAnimationFrame(draw);
      
      // Get frequency data
      this.analyser.getByteFrequencyData(this.dataArray);
      
      // Clear canvas
      this.ctx.fillStyle = 'rgb(249, 250, 251)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Draw frequency bars
      const barWidth = (this.canvas.width / this.dataArray.length) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < this.dataArray.length; i++) {
        barHeight = (this.dataArray[i] / 255) * this.canvas.height * 0.8;
        
        // Create gradient for bars
        const gradient = this.ctx.createLinearGradient(0, this.canvas.height - barHeight, 0, this.canvas.height);
        
        // Color based on frequency level
        if (this.dataArray[i] > 200) {
          gradient.addColorStop(0, 'rgb(239, 68, 68)'); // Red for high levels
          gradient.addColorStop(1, 'rgb(252, 165, 165)');
        } else if (this.dataArray[i] > 100) {
          gradient.addColorStop(0, 'rgb(59, 130, 246)'); // Blue for medium levels
          gradient.addColorStop(1, 'rgb(147, 197, 253)');
        } else {
          gradient.addColorStop(0, 'rgb(34, 197, 94)'); // Green for low levels
          gradient.addColorStop(1, 'rgb(134, 239, 172)');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth - 1, barHeight);
        
        x += barWidth;
      }
    };
    
    draw();
  }

  // Stop visualization
  stopVisualization() {
    // Cancel animation frame
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    // Clear canvas
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Stop media stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (error) {
        console.error('Error closing audio context:', error);
      }
      this.audioContext = null;
    }
    
    this.isInitialized = false;
  }

  // Update canvas reference
  updateCanvas(canvasRef) {
    this.canvas = canvasRef?.current || canvasRef;
    this.ctx = this.canvas?.getContext('2d');
  }

  // Get current audio level (0-100)
  getCurrentAudioLevel() {
    if (!this.analyser || !this.dataArray) return 0;
    
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate average audio level
    let total = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      total += this.dataArray[i];
    }
    
    return Math.round((total / this.dataArray.length / 255) * 100);
  }

  // Check if initialized
  isVisualizationInitialized() {
    return this.isInitialized;
  }
}

// Utility functions for browser compatibility
export const checkBrowserSupport = () => {
  const support = {
    speechRecognition: false,
    textToSpeech: false,
    mediaDevices: false,
    audioContext: false
  };

  // Check Speech Recognition
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    support.speechRecognition = true;
  }

  // Check Text-to-Speech
  if ('speechSynthesis' in window) {
    support.textToSpeech = true;
  }

  // Check Media Devices
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    support.mediaDevices = true;
  }

  // Check Audio Context
  if (window.AudioContext || window.webkitAudioContext) {
    support.audioContext = true;
  }

  return support;
};

// Get user-friendly browser support message
export const getBrowserSupportMessage = () => {
  const support = checkBrowserSupport();
  const messages = [];

  if (!support.speechRecognition) {
    messages.push('Speech recognition is not supported. Please use Chrome, Edge, or Safari for voice input.');
  }

  if (!support.textToSpeech) {
    messages.push('Text-to-speech is not supported in your browser.');
  }

  if (!support.mediaDevices) {
    messages.push('Microphone access is not supported. Please use HTTPS and a modern browser.');
  }

  if (!support.audioContext) {
    messages.push('Audio visualization is not supported in your browser.');
  }

  return messages.length > 0 ? messages : ['All speech features are supported in your browser!'];
};

// Request microphone permission
export const requestMicrophonePermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
    return true;
  } catch (error) {
    console.error('Microphone permission denied:', error);
    return false;
  }
};