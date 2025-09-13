"use client";
import React, { useState } from "react";

const VOICE_OPTIONS = [
    { name: "en-US-Neural2-A", label: "Neural2-A (Female)" },
    { name: "en-US-Neural2-B", label: "Neural2-B (Male)" },
    { name: "en-US-Neural2-C", label: "Neural2-C (Female)" },
    { name: "en-US-Neural2-D", label: "Neural2-D (Male)" },
    { name: "en-US-Neural2-E", label: "Neural2-E (Female)" },
    { name: "en-US-Neural2-F", label: "Neural2-F (Female)" },
    { name: "en-US-Neural2-G", label: "Neural2-G (Female)" },
    { name: "en-US-Neural2-H", label: "Neural2-H (Female)" },
    { name: "en-US-Neural2-I", label: "Neural2-I (Male)" },
    { name: "en-US-Neural2-J", label: "Neural2-J (Male)" },
    { name: "en-US-Wavenet-A", label: "Wavenet-A (Female)" },
    { name: "en-US-Wavenet-B", label: "Wavenet-B (Male)" },
    { name: "en-US-Wavenet-C", label: "Wavenet-C (Female)" },
    { name: "en-US-Wavenet-D", label: "Wavenet-D (Male)" },
    { name: "en-US-Wavenet-E", label: "Wavenet-E (Female)" },
    { name: "en-US-Wavenet-F", label: "Wavenet-F (Female)" },
    { name: "en-US-Standard-A", label: "Standard-A (Female)" },
    { name: "en-US-Standard-B", label: "Standard-B (Male)" },
    { name: "en-US-Standard-C", label: "Standard-C (Female)" },
    { name: "en-US-Standard-D", label: "Standard-D (Male)" },
];

export default function VoiceTest() {
    const [selectedVoice, setSelectedVoice] = useState("en-US-Neural2-C");
    const [testText, setTestText] = useState("Hello! I'm your AI assistant. How do I sound?");
    const [isPlaying, setIsPlaying] = useState(false);

    async function testVoice(voiceName: string) {
        if (isPlaying) return;

        setIsPlaying(true);
        try {
            const res = await fetch("/api/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: testText,
                    voiceName,
                    languageCode: "en-US",
                    speakingRate: 1.0,
                    pitch: 0.0
                }),
            });
            const data = await res.json();
            if (data.audioContent) {
                const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
                audio.onended = () => setIsPlaying(false);
                await audio.play();
            }
        } catch (e) {
            console.error("TTS failed:", e);
            setIsPlaying(false);
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            padding: '20px'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    padding: '24px'
                }}>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: 'bold',
                        marginBottom: '8px',
                        color: '#1e40af'
                    }}>
                        🎤 Voice Testing Studio
                    </h1>
                    <p style={{ color: '#64748b', marginBottom: '24px' }}>
                        Test different Google Cloud TTS voices to find your favorite!
                    </p>

                    {/* Test Text Input */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '16px',
                            fontWeight: '500',
                            marginBottom: '8px',
                            color: '#374151'
                        }}>
                            Test Text:
                        </label>
                        <textarea
                            value={testText}
                            onChange={(e) => setTestText(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px',
                                resize: 'vertical',
                                minHeight: '80px'
                            }}
                            placeholder="Enter text to test with different voices..."
                        />
                    </div>

                    {/* Voice Selection */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '16px',
                            fontWeight: '500',
                            marginBottom: '8px',
                            color: '#374151'
                        }}>
                            Select Voice:
                        </label>
                        <select
                            value={selectedVoice}
                            onChange={(e) => setSelectedVoice(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px',
                                backgroundColor: 'white'
                            }}
                        >
                            {VOICE_OPTIONS.map((voice) => (
                                <option key={voice.name} value={voice.name}>
                                    {voice.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Test Button */}
                    <button
                        onClick={() => testVoice(selectedVoice)}
                        disabled={isPlaying}
                        style={{
                            width: '100%',
                            padding: '12px 24px',
                            backgroundColor: isPlaying ? '#9ca3af' : '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '500',
                            cursor: isPlaying ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        {isPlaying ? (
                            <>
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    border: '2px solid white',
                                    borderTop: '2px solid transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}></div>
                                Playing...
                            </>
                        ) : (
                            <>
                                🎵 Test Voice
                            </>
                        )}
                    </button>

                    {/* Quick Test Buttons */}
                    <div style={{ marginTop: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
                            Quick Tests:
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                            {VOICE_OPTIONS.slice(0, 6).map((voice) => (
                                <button
                                    key={voice.name}
                                    onClick={() => testVoice(voice.name)}
                                    disabled={isPlaying}
                                    style={{
                                        padding: '8px 12px',
                                        backgroundColor: isPlaying ? '#f3f4f6' : '#f8fafc',
                                        color: isPlaying ? '#9ca3af' : '#374151',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        cursor: isPlaying ? 'not-allowed' : 'pointer',
                                        textAlign: 'left'
                                    }}
                                >
                                    {voice.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
