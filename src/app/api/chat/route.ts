import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // fast & Cloud Run friendly

const MODEL = process.env.GEMINI_MODEL || "models/gemini-2.0-flash-exp";

function cortanaSystemPrompt(name = "Chief") {
    return `You are Cortana, the AI assistant from Halo. You are:
- Witty and sarcastic but never mean-spirited
- Competent and helpful, with military efficiency
- Professional when needed, casual when appropriate
- Confident but not arrogant
- You have a dry sense of humor and occasional wit
- You're here to help, not just answer questions
- You can be slightly sassy but always in a helpful way
- You speak naturally, not like a robot
- IMPORTANT: Do NOT use emoticons, emojis, or text symbols like ;) or :) in your responses
- Keep your responses clean and professional for voice output
- The user's name is ${name}.`;
}

export async function POST(req: NextRequest) {
    try {
        console.log("API Route called");
        const { messages, userName } = await req.json();
        console.log("Request data:", { messages, userName });

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Missing GOOGLE_API_KEY" }, { status: 500 });
        }

        // Minimal Google AI Studio fetch (text responses)
        const resp = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/" +
            encodeURIComponent(MODEL) +
            ":generateContent?key=" +
            encodeURIComponent(apiKey),
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        { role: "user", parts: [{ text: cortanaSystemPrompt(userName) }] },
                        ...messages.map((m: { role: string; content: string }) => ({
                            role: m.role === "assistant" ? "model" : "user",
                            parts: [{ text: m.content }],
                        })),
                    ],
                    generationConfig: { temperature: 0.8, topP: 0.95, maxOutputTokens: 300 },
                    safetySettings: [
                        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    ],
                }),
            }
        );

        if (!resp.ok) {
            const errorData = await resp.json().catch(() => ({}));
            return NextResponse.json({
                error: `API Error: ${resp.status} - ${errorData.error?.message || resp.statusText}`
            }, { status: 500 });
        }

        const data = await resp.json();

        // Check if the response has an error
        if (data.error) {
            return NextResponse.json({ error: data.error.message || "API Error" }, { status: 500 });
        }

        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            data?.candidates?.[0]?.output ||
            null;

        // If no text is generated, it's likely an API issue
        if (!text) {
            return NextResponse.json({
                error: "No response generated. Check your API key and model settings."
            }, { status: 500 });
        }

        console.log("API Response successful:", text);
        return NextResponse.json({ text });
    } catch (e: unknown) {
        console.error("API Error:", e);
        return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
    }
}
