// frontend/src/pages/ConversationalInterview/components/AudioVisualization.jsx

import React, { useEffect, useRef, useState } from 'react';

const AudioVisualization = ({ isListening }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [dataArray, setDataArray] = useState(null);

  useEffect(() => {
    if (isListening) {
      initializeAudio();
    } else {
      stopVisualization();
    }

    return () => {
      stopVisualization();
    };
  }, [isListening]);

  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      
      const analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 256;
      
      source.connect(analyserNode);
      
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArr = new Uint8Array(bufferLength);
      
      setAudioContext(audioCtx);
      setAnalyser(analyserNode);
      setDataArray(dataArr);
      
      startVisualization(analyserNode, dataArr);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const startVisualization = (analyserNode, dataArr) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      if (!isListening) return;
      
      animationRef.current = requestAnimationFrame(draw);
      
      analyserNode.getByteFrequencyData(dataArr);
      
      // Clear canvas
      ctx.fillStyle = 'rgb(249, 250, 251)';
      ctx.fillRect(0, 0, width, height);
      
      // Draw bars
      const barWidth = (width / dataArr.length) * 2;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < dataArr.length; i++) {
        barHeight = (dataArr[i] / 255) * height * 0.7;
        
        // Gradient color based on frequency
        const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
        gradient.addColorStop(0, `rgb(59, 130, 246)`); // Blue
        gradient.addColorStop(1, `rgb(147, 197, 253)`); // Light blue
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
        
        x += barWidth;
      }
    };
    
    draw();
  };

  const stopVisualization = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close();
    }
    
    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="mt-4">
      <canvas
        ref={canvasRef}
        width={280}
        height={60}
        className="w-full h-15 bg-gray-50 rounded border"
      />
      {!isListening && (
        <p className="text-xs text-gray-500 text-center mt-2">
          Audio visualization will appear when listening
        </p>
      )}
    </div>
  );
};

export default AudioVisualization;