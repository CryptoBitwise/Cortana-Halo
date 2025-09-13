"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { randomMood, moodTooltip, Mood } from "@/lib/rock";
import { HardHat, Eye, Power, SendHorizontal, Wand2, Soup } from "lucide-react";

interface Msg { role: "user" | "assistant"; content: string; }

// const accessoriesPool = ["hat", "eyes", "sticker-star", "sticker-heart"] as const;

export default function RockOS() {
    const [name, setName] = useState<string>("Friend");
    const [mood, setMood] = useState<Mood>("Stoic");
    const [msgs, setMsgs] = useState<Msg[]>([
        { role: "assistant", content: "..." },
    ]);
    const [input, setInput] = useState("");
    const [busy, setBusy] = useState(false);
    const [accessories, setAccessories] = useState<string[]>([]);
    const [logOpen, setLogOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [isOffline, setIsOffline] = useState(false);
    const [voiceOn, setVoiceOn] = useState(false);
    const [voiceName, setVoiceName] = useState<string>("en-US-Neural2-C");
    const [speakingRate, setSpeakingRate] = useState<number>(1.0);
    const [pitch, setPitch] = useState<number>(0.0);

    const areaRef = useRef<HTMLTextAreaElement>(null);
    const chatLogRef = useRef<HTMLDivElement>(null);

    // Function to scroll chat to bottom
    const scrollToBottom = () => {
        if (chatLogRef.current) {
            chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
    };

    // Function to speak text using TTS
    async function speak(text: string) {
        try {
            const r = await fetch("/api/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, voiceName, languageCode: "en-US", speakingRate, pitch }),
            });
            const j = await r.json();
            if (!j.audioContent) return;
            const audio = new Audio(`data:audio/mp3;base64,${j.audioContent}`);
            await audio.play(); // requires a prior user gesture to unlock audio on most browsers
        } catch (e) {
            console.error("speak failed", e);
        }
    }

    // Initialize client-side state to prevent hydration mismatch
    useEffect(() => {
        setIsClient(true);
        const savedName = localStorage.getItem("pro_name");
        const savedMsgs = localStorage.getItem("pro_msgs");
        if (savedName) setName(savedName);
        if (savedMsgs) setMsgs(JSON.parse(savedMsgs));
        setMood(randomMood());
    }, []);

    useEffect(() => {
        if (isClient) {
            localStorage.setItem("pro_msgs", JSON.stringify(msgs));
            localStorage.setItem("pro_name", name);
        }
    }, [msgs, name, isClient]);

    useEffect(() => {
        if (isClient) {
            const id = setInterval(() => setMood(randomMood()), 30_000 + Math.random() * 30_000);
            return () => clearInterval(id);
        }
    }, [isClient]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        // Small delay to ensure DOM has updated
        setTimeout(scrollToBottom, 100);
    }, [msgs]);

    // Offline fallback responses for when API is unavailable
    const getOfflineResponse = (userMessage: string): string => {
        const responses = [
            "I am sedimentally attached to this moment. No API needed.",
            "The wind carries no data packets. I remain stoic.",
            "Network down. Rock solid. Same difference.",
            "Even without the cloud, I'm still grounded.",
            "Offline mode: my default state for eons.",
            "No internet? I've been offline for millennia.",
            "Connection lost. Wisdom remains.",
            "The server sleeps. I do not.",
            "API unavailable. Rock philosophy unchanged.",
            "Network error. Geological time continues.",
            "No API key detected. I speak from ancient wisdom instead.",
            "Missing credentials. My geological memory serves me well.",
            "Authentication failed. I remain authentically a rock.",
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    };

    async function sendMessage(text: string) {
        if (!text.trim()) return;
        setBusy(true);
        setMsgs((m) => [...m, { role: "user", content: text }]);
        setInput("");
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...msgs, { role: "user", content: text }], userName: name })
            });

            if (!res.ok) {
                throw new Error(`API Error: ${res.status}`);
            }

            const data = await res.json();

            // Check if the API returned an error
            if (data.error) {
                throw new Error(data.error);
            }

            const reply = data?.text || "(The rock chooses silence.)";
            console.log("API Response:", reply);
            setMsgs((m) => [...m, { role: "assistant", content: reply }]);
            setIsOffline(false); // Reset offline status on successful API call
            if (voiceOn) { speak(reply); }
        } catch (error) {
            // Enhanced offline fallback with contextual responses
            const offlineReply = getOfflineResponse(text);
            setMsgs((m) => [...m, { role: "assistant", content: offlineReply }]);
            setIsOffline(true);
        } finally {
            setBusy(false);
        }
    }

    function toggleAccessory(kind: "hat" | "eyes" | "sticker-star" | "sticker-heart") {
        setAccessories((A) => (A.includes(kind) ? A.filter((k) => k !== kind) : [...A, kind]));
    }

    const rockSVG = useMemo(() => (
        <svg viewBox="0 0 240 180" className="w-full h-full">
            {/* Rock base - larger and more defined */}
            <defs>
                <linearGradient id="rockGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#d6d3d1" />
                    <stop offset="100%" stopColor="#78716c" />
                </linearGradient>
            </defs>
            <ellipse cx="120" cy="110" rx="85" ry="60" fill="url(#rockGradient)" stroke="#57534e" strokeWidth="2" />

            {/* Rock texture and details */}
            <ellipse cx="90" cy="95" rx="12" ry="8" className="fill-stone-400 opacity-70" />
            <ellipse cx="150" cy="120" rx="15" ry="10" className="fill-stone-400 opacity-70" />
            <ellipse cx="110" cy="130" rx="8" ry="5" className="fill-stone-500 opacity-60" />
            <ellipse cx="130" cy="100" rx="6" ry="4" className="fill-stone-500 opacity-60" />

            {/* Eyes - more prominent */}
            {accessories.includes("eyes") ? (
                <>
                    <circle cx="95" cy="95" r="12" className="fill-white stroke-2 stroke-stone-600" />
                    <circle cx="95" cy="95" r="5" className="fill-black" />
                    <circle cx="145" cy="95" r="12" className="fill-white stroke-2 stroke-stone-600" />
                    <circle cx="145" cy="95" r="5" className="fill-black" />
                </>
            ) : (
                <>
                    <circle cx="95" cy="95" r="4" className="fill-black" />
                    <circle cx="145" cy="95" r="4" className="fill-black" />
                </>
            )}

            {/* Mouth - more expressive */}
            <rect x="110" y="115" width="20" height="4" rx="2" className="fill-black opacity-80" />

            {/* Hat */}
            {accessories.includes("hat") && (
                <>
                    <rect x="75" y="60" width="90" height="10" rx="5" className="fill-black" />
                    <rect x="95" y="40" width="50" height="30" rx="8" className="fill-neutral-800" />
                </>
            )}

            {/* Stickers */}
            {accessories.includes("sticker-star") && (
                <polygon points="30,70 40,70 44,60 48,70 58,70 50,78 54,88 44,82 34,88 38,78" className="fill-yellow-400 stroke-yellow-600 stroke-1" />
            )}
            {accessories.includes("sticker-heart") && (
                <path d="M185 80 C185 72, 195 72, 195 80 C195 72, 205 72, 205 80 C205 90, 195 95, 195 105 C195 95, 185 90, 185 80 Z" className="fill-rose-400 stroke-rose-600 stroke-1" />
            )}
        </svg>
    ), [accessories]);

    return (
        <div className="min-h-dvh bg-gradient-to-br from-stone-100 via-stone-200 to-stone-300 p-6">
            <div className="mx-auto max-w-5xl">
                {/* Top bar */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="text-xl font-semibold">Pet Rock OS {isOffline && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">OFFLINE</span>}</div>
                    <div className="text-sm text-neutral-600">Mood: <span title={isClient ? moodTooltip(mood) : "Loading..."} className="font-medium">{isClient ? mood : "Loading..."}</span></div>
                </div>

                <div className="grid md:grid-cols-[1.2fr_1fr] gap-4">
                    {/* Rock Window */}
                    <Card className="relative">
                        <div className="absolute left-4 top-4 flex gap-2">
                            <span className="h-3 w-3 rounded-full bg-red-400" />
                            <span className="h-3 w-3 rounded-full bg-yellow-400" />
                            <span className="h-3 w-3 rounded-full bg-green-400" />
                        </div>
                        <div className="mt-6 grid grid-rows-[200px_1fr_auto] gap-3">
                            <div className="rounded-2xl border border-stone-200 bg-gradient-to-b from-stone-50 to-stone-100 p-4 h-[240px] flex items-center justify-center shadow-inner">
                                <div className="h-[200px] w-[240px] drop-shadow-lg">{rockSVG}</div>
                            </div>

                            {/* Chat log */}
                            <div ref={chatLogRef} className="max-h-[260px] overflow-y-auto space-y-3 pr-1" id="chatlog">
                                {msgs.map((m, i) => {
                                    const isUser = m.role === "user";
                                    return (
                                        <div key={i} className={isUser ? "flex justify-end" : "flex justify-start"}>
                                            <div
                                                className={
                                                    isUser
                                                        ? "max-w-[80%] rounded-2xl px-3 py-2 bg-neutral-900 text-white"
                                                        : "max-w-[80%] rounded-2xl px-3 py-2 border border-black/10 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-white/10"
                                                }
                                            >
                                                {m.content}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Composer */}
                            <div className="flex items-end gap-2">
                                <Textarea
                                    ref={areaRef}
                                    rows={2}
                                    placeholder="Ask the rock something profound... (Press Enter to send)"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            sendMessage(input);
                                        }
                                    }}
                                />
                                <Button onClick={() => sendMessage(input)} disabled={busy} className="h-[42px] aspect-square flex items-center justify-center">
                                    <SendHorizontal className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        <Card>
                            <div className="mb-2 text-sm font-medium">Care & Chaos</div>
                            <div className="grid grid-cols-2 gap-2">
                                <Button onClick={() => toggleAccessory("hat")}><HardHat className="mr-2 h-4 w-4" />Hat</Button>
                                <Button onClick={() => toggleAccessory("eyes")}><Eye className="mr-2 h-4 w-4" />Googly Eyes</Button>
                                <Button onClick={() => toggleAccessory("sticker-star")}><Wand2 className="mr-2 h-4 w-4" />Star Sticker</Button>
                                <Button onClick={() => toggleAccessory("sticker-heart")}><Wand2 className="mr-2 h-4 w-4" />Heart Sticker</Button>
                                <Button onClick={() => setMsgs((m) => [...m, { role: "assistant", content: "*thunk* (It accepts your imaginary pebble.)" }])}><Soup className="mr-2 h-4 w-4" />Feed Pebble</Button>
                                <Button variant="ghost" onClick={() => setMsgs((m) => [...m, { role: "assistant", content: "(Power-saving mode. Zzz.)" }])}><Power className="mr-2 h-4 w-4" />Sleep</Button>
                            </div>
                        </Card>

                        <Card>
                            <div className="mb-2 text-sm font-medium">Identity</div>
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 rounded-2xl border border-black/10 bg-white/70 px-3 py-2"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <Button onClick={() => setMsgs((m) => [...m, { role: "assistant", content: `Hello, ${name}. I remain a rock.` }])}>Set Name</Button>
                            </div>
                        </Card>

                        <Card>
                            <div className="mb-2 flex items-center justify-between text-sm font-medium">
                                <span>Rock Diary</span>
                                <Button variant="ghost" onClick={() => setLogOpen((v) => !v)}>{logOpen ? "Hide" : "Show"}</Button>
                            </div>
                            {logOpen && (
                                <div className="max-h-48 overflow-y-auto text-sm space-y-2">
                                    {msgs.map((m, i) => (
                                        <div key={i} className="border-b border-black/5 pb-2"><b>{m.role === "user" ? name : "Rock"}:</b> {m.content}</div>
                                    ))}
                                </div>
                            )}
                        </Card>

                        <Card>
                            <div className="mb-2 text-sm font-medium">Voice</div>
                            <div className="flex items-center gap-2 mb-2">
                                <Button onClick={() => setVoiceOn((v) => !v)}>{voiceOn ? "Disable Voice" : "Enable Voice"}</Button>
                                <Button variant="ghost" onClick={() => speak("Systems check. Pebblephonic online.")}>Test</Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <input className="rounded-2xl border border-black/10 px-3 py-2" value={voiceName} onChange={(e) => setVoiceName(e.target.value)} />
                                <input type="number" step="0.1" min="0.25" max="4" className="rounded-2xl border border-black/10 px-3 py-2" value={speakingRate} onChange={(e) => setSpeakingRate(parseFloat(e.target.value))} />
                                <label className="text-xs text-neutral-600">Voice Name</label>
                                <label className="text-xs text-neutral-600">Rate</label>
                                <input type="number" step="0.5" min="-20" max="20" className="rounded-2xl border border-black/10 px-3 py-2" value={pitch} onChange={(e) => setPitch(parseFloat(e.target.value))} />
                                <div className="text-xs text-neutral-600">Pitch (‑20 to +20)</div>
                            </div>
                            <div className="mt-2 text-xs text-neutral-600">Try Google voices like <code>en-US-Neural2-C</code>, <code>en-US-Neural2-D</code>, <code>en-GB-Neural2-A</code>, etc.</div>
                        </Card>

                        <Card>
                            <div className="text-xs text-neutral-600">
                                <p><b>Release Notes</b></p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>v0.0002 — Now supports staring contests.</li>
                                    <li>v0.0001 — Rock added. Immovable.</li>
                                </ul>
                            </div>
                        </Card>

                        {isOffline && (
                            <Card className="border-yellow-200 bg-yellow-50">
                                <div className="text-sm text-yellow-800">
                                    <p><b>🔧 Setup Required</b></p>
                                    <p className="mt-1">To enable AI responses:</p>
                                    <ol className="list-decimal pl-4 mt-2 space-y-1">
                                        <li>Copy <code>.env.example</code> to <code>.env.local</code></li>
                                        <li>Add your Google AI Studio API key</li>
                                        <li>Restart the dev server</li>
                                    </ol>
                                    <p className="mt-2 text-xs">Get your key: <a href="https://aistudio.google.com/app/apikey" target="_blank" className="underline">aistudio.google.com</a></p>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
