import { NextRequest, NextResponse } from "next/server";
import textToSpeech from "@google-cloud/text-to-speech";

export const runtime = "nodejs"; // TTS requires Node (edge lacks crypto needed for auth)

// Initialize the TTS client using environment variables
const client = new textToSpeech.TextToSpeechClient({
    credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL?.replace(/"/g, ''),
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/"/g, '').replace(/\\n/g, '\n'),
    },
});

export async function POST(req: NextRequest) {
    try {
        console.log("TTS API called");
        console.log("Environment check:", {
            hasClientEmail: !!process.env.GCP_CLIENT_EMAIL,
            hasPrivateKey: !!process.env.GCP_PRIVATE_KEY,
            clientEmail: process.env.GCP_CLIENT_EMAIL?.substring(0, 10) + "...",
        });
        const body = await req.json();
        console.log("TTS request body:", body);

        const text: string = body?.text || "Hello, from Pet Rock OS.";
        const voiceName = body?.voiceName || process.env.TTS_VOICE_NAME || "en-US-Neural2-C";
        const languageCode = body?.languageCode || process.env.TTS_VOICE_LANG || "en-US";
        const speakingRate = Number(body?.speakingRate ?? process.env.TTS_SPEAKING_RATE ?? 1.0);
        const pitch = Number(body?.pitch ?? process.env.TTS_PITCH ?? 0.0);

        console.log("Creating TTS request...");
        const request = {
            input: { text },
            voice: {
                languageCode,
                name: voiceName,
                ssmlGender: "FEMALE" as const
            },
            audioConfig: {
                audioEncoding: "MP3" as const,
                speakingRate,
                pitch,
                volumeGainDb: 0.0,
                effectsProfileId: ["small-bluetooth-speaker-class-device"],
            },
        };

        console.log("Synthesizing speech...");
        const [response] = await client.synthesizeSpeech(request);

        if (!response.audioContent) {
            throw new Error("No audio content returned from TTS API");
        }

        console.log("TTS successful, returning audio content");
        return NextResponse.json({
            audioContent: response.audioContent.toString("base64")
        });
    } catch (e: unknown) {
        console.error("TTS API error:", e);
        console.error("Error details:", {
            name: e instanceof Error ? e.name : 'Unknown',
            message: e instanceof Error ? e.message : 'Unknown error',
            stack: e instanceof Error ? e.stack : 'No stack trace'
        });
        return NextResponse.json({
            error: e instanceof Error ? e.message : "Unknown TTS error"
        }, { status: 500 });
    }
}