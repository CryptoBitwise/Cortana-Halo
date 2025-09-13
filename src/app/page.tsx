"use client";
import React, { useEffect, useRef, useState, ChangeEvent, KeyboardEvent } from "react";

interface Msg { 
  role: "user" | "assistant"; 
  content: string; 
  timestamp?: Date;
}

export default function CortanaUI() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Hello! I'm Cortana, your AI assistant. I'm here to help you with whatever you need - whether that's answering questions, helping with tasks, or just having a conversation. What can I do for you today?" },
  ]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceName, setVoiceName] = useState("en-US-Chirp3-HD-Achernar");
  const [speakingRate, setSpeakingRate] = useState(1.0);
  const [pitch, setPitch] = useState(0.0);
  const [isConnected, setIsConnected] = useState(true);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const chatLogRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [msgs]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        handleSend(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  async function speak(text: string) {
    try {
      setIsSpeaking(true);
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text, 
          voiceName, 
          languageCode: "en-US", 
          speakingRate, 
          pitch 
        }),
      });
      const data = await res.json();
      if (data.audioContent) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        audio.onended = () => setIsSpeaking(false);
        await audio.play();
      }
    } catch (e) {
      console.error("TTS failed:", e);
      setIsSpeaking(false);
    }
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  async function handleSend(text: string = message) {
    if (!text.trim() || busy) return;
    
    setBusy(true);
    const userMessage = { role: "user" as const, content: text, timestamp: new Date() };
    setMsgs(prev => [...prev, userMessage]);
    setMessage("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...msgs, { role: "user", content: text }], 
          userName: "User" 
        })
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }

      const data = await res.json();
      const reply = data?.text || "Sorry, I couldn't process that request.";
      
      const aiMessage = { role: "assistant" as const, content: reply, timestamp: new Date() };
      setMsgs(prev => [...prev, aiMessage]);
      
      // Always speak the response
      await speak(reply);
    } catch (error) {
      const errorMsg = "Sorry, I'm having trouble connecting. Please try again.";
      const errorMessage = { role: "assistant" as const, content: errorMsg, timestamp: new Date() };
      setMsgs(prev => [...prev, errorMessage]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black flex flex-col">
      {/* Header */}
      <div className="p-6 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">CORTANA</h1>
        <div className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
          {isConnected ? '● Connected' : '● Disconnected'}
        </div>
      </div>

      {/* Animated Cortana Dot - Center */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          {/* Ambient glow - always present */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 to-purple-400/20 scale-150 animate-pulse"></div>
          
          {/* Outer energy rings */}
          {(isListening || isSpeaking) && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping scale-150"></div>
              <div className="absolute inset-0 rounded-full border border-cyan-300 animate-pulse scale-125"></div>
            </>
          )}
          
          {/* Breathing idle animation rings */}
          {!isListening && !isSpeaking && (
            <>
              <div className="absolute inset-0 rounded-full border border-purple-400/40 scale-110 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border border-cyan-400/30 scale-120 animate-pulse" style={{animationDelay: '1s'}}></div>
            </>
          )}
          
          {/* Main core dot */}
          <div className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
            isSpeaking ? 'bg-gradient-to-r from-cyan-400 to-blue-500 scale-110' :
            isListening ? 'bg-gradient-to-r from-green-400 to-emerald-500 scale-105' :
            'bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 animate-pulse'
          }`}>
            {/* Inner glow effect */}
            <div className="absolute inset-2 rounded-full bg-white/20 animate-pulse"></div>
            
            {/* Core particle effect */}
            <div className="relative">
              {isSpeaking ? (
                <div className="w-12 h-12 text-white animate-bounce flex items-center justify-center">
                  🔊
                </div>
              ) : isListening ? (
                <div className="w-12 h-12 text-white animate-pulse flex items-center justify-center">
                  🎤
                </div>
              ) : (
                <div className="relative">
                  <div className="w-8 h-8 bg-white rounded-full opacity-90 animate-pulse"></div>
                  <div className="absolute inset-0 w-8 h-8 bg-cyan-300 rounded-full opacity-50 animate-ping"></div>
                </div>
              )}
            </div>
          </div>

          {/* Floating particles around the dot */}
          {!isListening && !isSpeaking && (
            <div className="absolute inset-0">
              <div className="absolute w-2 h-2 bg-cyan-400 rounded-full top-8 left-16 animate-ping opacity-70" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute w-1 h-1 bg-purple-400 rounded-full top-20 right-12 animate-pulse opacity-60" style={{animationDelay: '1.2s'}}></div>
              <div className="absolute w-1.5 h-1.5 bg-blue-300 rounded-full bottom-12 left-20 animate-pulse opacity-50" style={{animationDelay: '2s'}}></div>
              <div className="absolute w-1 h-1 bg-cyan-300 rounded-full bottom-16 right-16 animate-ping opacity-40" style={{animationDelay: '0.8s'}}></div>
            </div>
          )}

          {/* Status text with glow */}
          <div className="text-center mt-8">
            <p className={`text-lg font-medium transition-all duration-300 ${
              isSpeaking ? 'text-cyan-300 animate-pulse' :
              isListening ? 'text-green-300 animate-pulse' :
              'text-white/90'
            }`}>
              {isSpeaking ? 'Speaking...' :
               isListening ? 'Listening...' :
               'I\'m here and ready'}
            </p>
          </div>
        </div>
      </div>

      {/* Chat History */}
      <div className="max-w-2xl mx-auto w-full px-4 max-h-64 overflow-y-auto mb-4" ref={chatLogRef}>
        {msgs.map((msg, idx) => (
          <div key={idx} className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg max-w-xs ${
              msg.role === 'user' 
                ? 'bg-cyan-600 text-white' 
                : 'bg-gray-700 text-gray-100'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {busy && (
          <div className="text-left mb-3">
            <div className="inline-block p-3 rounded-lg bg-gray-700 text-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={message}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
              onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message or use voice..."
              className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-cyan-400 focus:outline-none"
            />
            <button
              onClick={() => handleSend()}
              disabled={!message.trim() || busy}
              className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ➤
            </button>
          </div>

          {/* Voice Controls */}
          <div className="flex justify-center gap-4">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isListening 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isListening ? (
                <>
                  🎤 Stop Listening
                </>
              ) : (
                <>
                  🎤 Start Voice
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Audio element */}
      <audio
        ref={audioRef}
        onEnded={() => setIsSpeaking(false)}
        style={{ display: 'none' }}
      />
    </div>
  );
}