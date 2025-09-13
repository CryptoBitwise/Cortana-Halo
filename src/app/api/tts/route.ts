import { NextRequest, NextResponse } from "next/server";
import textToSpeech from "@google-cloud/text-to-speech";
import fs from "fs";
import path from "path";

export const runtime = "nodejs"; // TTS requires Node (edge lacks crypto needed for auth)

// Initialize the TTS client using the service account file
const serviceAccountPath = path.join(process.cwd(), 'service-account.json');
const client = new textToSpeech.TextToSpeechClient({
    keyFilename: serviceAccountPath
});

export async function POST(req: NextRequest) {
    try {
        console.log("TTS API called");
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
        return NextResponse.json({
            error: e instanceof Error ? e.message : "Unknown TTS error"
        }, { status: 500 });
    }
}