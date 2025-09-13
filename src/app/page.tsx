"use client";
import React, { useEffect, useRef, useState, ChangeEvent, KeyboardEvent } from "react";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBox() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Hello! I'm Cortana, your AI assistant. I'm here to help you with whatever you need - whether that's answering questions, helping with tasks, or just having a conversation. What can I do for you today?" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [voiceName, setVoiceName] = useState("en-US-Chirp3-HD-Achernar"); // Change this to your preferred voice
  const [speakingRate, setSpeakingRate] = useState(1.0);
  const [pitch, setPitch] = useState(0.0);
  const chatLogRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [msgs]);

  async function speak(text: string) {
    if (!voiceOn) return;
    try {
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
        await audio.play();
      }
    } catch (e) {
      console.error("TTS failed:", e);
    }
  }

  async function sendMessage(text: string) {
    if (!text.trim() || busy) return;

    setBusy(true);
    setMsgs(prev => [...prev, { role: "user", content: text }]);
    setInput("");

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

      setMsgs(prev => [...prev, { role: "assistant", content: reply }]);

      if (voiceOn) {
        await speak(reply);
      }
    } catch (error) {
      const errorMsg = "Sorry, I'm having trouble connecting. Please try again.";
      setMsgs(prev => [...prev, { role: "assistant", content: errorMsg }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '16px',
      position: 'relative'
    }}>
      {/* Cortana-style background elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '15%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite reverse'
      }}></div>
      <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              borderRadius: '50%'
            }}></div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              margin: 0,
              background: 'linear-gradient(45deg, #fff, #e0e7ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              ⚡ Cortana
            </h1>
            <p style={{ color: '#e0e7ff', margin: '8px 0 0 0', fontSize: '16px' }}>
              "I'm here to help. What do you need?"
            </p>
          </div>

          {/* Chat Messages */}
          <div
            ref={chatLogRef}
            style={{
              height: '384px',
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {msgs.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
              }}>
                <div
                  style={{
                    maxWidth: '80%',
                    borderRadius: msg.role === "user" ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding: '12px 16px',
                    backgroundColor: msg.role === "user" ? '#667eea' : '#f8fafc',
                    color: msg.role === "user" ? 'white' : '#374151',
                    border: msg.role === "assistant" ? '1px solid #e2e8f0' : 'none',
                    boxShadow: msg.role === "assistant" ? '0 2px 4px rgba(0,0,0,0.05)' : '0 2px 8px rgba(102, 126, 234, 0.3)',
                    position: 'relative'
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {busy && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  backgroundColor: '#f3f4f6',
                  color: '#1f2937',
                  borderRadius: '16px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #4b5563',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div style={{
            borderTop: '1px solid #e5e7eb',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={input}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Ask Cortana anything... (Press Enter to send)"
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  outline: 'none'
                }}
                disabled={busy}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={busy || !input.trim()}
                style={{
                  padding: '8px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: busy || !input.trim() ? 'not-allowed' : 'pointer',
                  opacity: busy || !input.trim() ? 0.5 : 1,
                  fontWeight: '500',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                ⚡ Send
              </button>
            </div>
          </div>

          {/* Voice Controls */}
          <div style={{
            borderTop: '1px solid #e2e8f0',
            padding: '16px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={voiceOn}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setVoiceOn(e.target.checked)}
                  style={{
                    borderRadius: '4px',
                    accentColor: '#667eea'
                  }}
                />
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  🎤 Enable Cortana's Voice
                </span>
              </label>

              {voiceOn && (
                <>
                  <input
                    type="text"
                    value={voiceName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setVoiceName(e.target.value)}
                    placeholder="Voice name"
                    style={{
                      padding: '4px 8px',
                      fontSize: '14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px'
                    }}
                  />
                  <input
                    type="number"
                    value={speakingRate}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSpeakingRate(parseFloat(e.target.value))}
                    min="0.25"
                    max="4"
                    step="0.1"
                    style={{
                      padding: '4px 8px',
                      fontSize: '14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      width: '80px'
                    }}
                  />
                  <input
                    type="number"
                    value={pitch}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPitch(parseFloat(e.target.value))}
                    min="-20"
                    max="20"
                    step="0.5"
                    style={{
                      padding: '4px 8px',
                      fontSize: '14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      width: '80px'
                    }}
                  />
                </>
              )}
            </div>

            {voiceOn && (
              <button
                onClick={() => speak("Hello! This is Cortana. How do I sound?")}
                style={{
                  padding: '6px 16px',
                  fontSize: '14px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                }}
              >
                🎵 Test Cortana's Voice
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
}