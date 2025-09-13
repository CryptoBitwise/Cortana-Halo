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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 50%, #000000 100%)',
      display: 'flex',
      flexDirection: 'column',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '8px' }}>CORTANA</h1>
        <div style={{ 
          fontSize: '14px', 
          color: isConnected ? '#4ade80' : '#f87171' 
        }}>
          {isConnected ? '● Connected' : '● Disconnected'}
        </div>
      </div>

      {/* Animated Cortana Dot - Center */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative' }}>
          {/* Main core dot */}
          <div style={{
            position: 'relative',
            width: '128px',
            height: '128px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isSpeaking ? 'linear-gradient(90deg, #22d3ee 0%, #3b82f6 100%)' :
                       isListening ? 'linear-gradient(90deg, #4ade80 0%, #10b981 100%)' :
                       'linear-gradient(90deg, #a855f7 0%, #22d3ee 50%, #a855f7 100%)',
            transform: isSpeaking ? 'scale(1.1)' : isListening ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 0.5s ease',
            boxShadow: '0 0 30px rgba(34, 211, 238, 0.5)'
          }}>
            {/* Core particle effect */}
            <div style={{ position: 'relative' }}>
              {isSpeaking ? (
                <div style={{
                  width: '48px',
                  height: '48px',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  🔊
                </div>
              ) : isListening ? (
                <div style={{
                  width: '48px',
                  height: '48px',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  🎤
                </div>
              ) : (
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'white',
                  borderRadius: '50%',
                  opacity: 0.9
                }}></div>
              )}
            </div>
          </div>

          {/* Status text */}
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <p style={{
              fontSize: '18px',
              fontWeight: '500',
              color: isSpeaking ? '#67e8f9' : isListening ? '#86efac' : 'rgba(255, 255, 255, 0.9)'
            }}>
              {isSpeaking ? 'Speaking...' :
               isListening ? 'Listening...' :
               'I\'m here and ready'}
            </p>
          </div>
        </div>
      </div>

      {/* Chat History */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%',
        padding: '0 16px',
        maxHeight: '200px',
        overflowY: 'auto',
        marginBottom: '16px'
      }} ref={chatLogRef}>
        {msgs.map((msg, idx) => (
          <div key={idx} style={{
            marginBottom: '12px',
            textAlign: msg.role === 'user' ? 'right' : 'left'
          }}>
            <div style={{
              display: 'inline-block',
              padding: '12px',
              borderRadius: '12px',
              maxWidth: '300px',
              backgroundColor: msg.role === 'user' ? '#0891b2' : '#374151',
              color: 'white'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {busy && (
          <div style={{ textAlign: 'left', marginBottom: '12px' }}>
            <div style={{
              display: 'inline-block',
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: '#374151',
              color: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #9ca3af',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{ padding: '24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input
              type="text"
              value={message}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
              onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message or use voice..."
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#1f2937',
                color: 'white',
                borderRadius: '8px',
                border: '1px solid #374151',
                outline: 'none'
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!message.trim() || busy}
              style={{
                padding: '12px 24px',
                backgroundColor: '#0891b2',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                cursor: busy || !message.trim() ? 'not-allowed' : 'pointer',
                opacity: busy || !message.trim() ? 0.5 : 1
              }}
            >
              ➤
            </button>
          </div>

          {/* Voice Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <button
              onClick={isListening ? stopListening : startListening}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '500',
                backgroundColor: isListening ? '#dc2626' : '#16a34a',
                color: 'white',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {isListening ? '🎤 Stop Listening' : '🎤 Start Voice'}
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

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}