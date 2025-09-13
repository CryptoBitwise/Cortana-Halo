# Pet Rock OS

A micro-OS with one window: your sarcastic pet rock.

## Dev

- `npm run dev` — start local dev
- `npm run build && npm start` — prod

## Env

- `GOOGLE_API_KEY` — from Google AI Studio
- `GEMINI_MODEL` — defaults to models/gemini-2.0-flash-exp

## Deploy to Cloud Run (one-time)

1. `gcloud auth login`
2. `gcloud config set project YOUR_PROJECT_ID`
3. `gcloud run deploy pet-rock-os --source . --region us-central1 --allow-unauthenticated`

## Notes

- The rock has moods that change randomly.
- Accessorize with toggles; it remembers your chats in localStorage.
- API route keeps your key server-side.
