# Cortana Chat Interface

A Next.js application featuring Cortana-style AI chat with Google Cloud TTS integration.

## Features

- **Cortana Personality**: Witty, helpful AI assistant with Halo-inspired personality
- **Voice Integration**: Google Cloud Text-to-Speech with multiple voice options
- **Modern UI**: Purple gradient theme with floating animations
- **Voice Testing**: Built-in voice testing page at `/voices`
- **Real-time Chat**: Smooth messaging with auto-scroll

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file with your API keys:

```
# Google AI Studio API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Google Cloud TTS Credentials
GCP_CLIENT_EMAIL=your_client_email_here
GCP_PRIVATE_KEY=your_private_key_here

# Optional TTS Settings
TTS_VOICE_NAME=en-US-Chirp3-HD-Achernar
TTS_VOICE_LANG=en-US
TTS_SPEAKING_RATE=1.0
TTS_PITCH=0.0
```

3. Run the development server:

```bash
npm run dev
```

## API Keys Setup

### Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add it to your `.env.local` as `GEMINI_API_KEY`

### Google Cloud TTS

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Text-to-Speech API
3. Create a service account with TTS permissions
4. Download the JSON credentials
5. Extract `client_email` and `private_key` from the JSON
6. Add them to your `.env.local` as `GCP_CLIENT_EMAIL` and `GCP_PRIVATE_KEY`

## Voice Testing

Visit `/voices` to test different Google Cloud TTS voices and find your favorite!

## Security Note

The `service-account.json` file is gitignored for security. Use environment variables instead.
