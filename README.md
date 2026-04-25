# EventConnect

> Scan a badge. AI tells you why you should meet, exactly what to say, and writes the follow-up. The AI networking buddy for tech events.

---

## The flow

- Sign in with Google.
- Fill out a short profile (role, company, what you're building, what you're looking for).
- Show your QR badge — anyone can scan it to grab your profile.
- Scan others' QR badges with your camera.
- Gemini instantly serves an icebreaker + a 0-100 match score so you know *why* this person is worth talking to.
- Save the connection with one tap.
- After the event, Gemini drafts a personalized follow-up DM for every saved connection.

## Stack

| Layer            | Tech                                                |
| ---------------- | --------------------------------------------------- |
| Framework        | Next.js 16 (App Router) + TypeScript                |
| Styling          | Tailwind CSS v4                                     |
| Auth             | Firebase Authentication (Google sign-in)            |
| Database         | Cloud Firestore (Native mode)                       |
| AI               | Gemini 2.0 Flash via `@google/generative-ai`        |
| QR scanning      | `html5-qrcode`                                      |
| QR rendering     | `react-qr-code`                                     |
| Deploy (primary) | Firebase App Hosting                                |
| Deploy (alt)     | Cloud Run (Docker, Next.js standalone output)       |

## Quick start

Local development.

1. Install dependencies.
   ```bash
   npm install
   ```
2. Create a Firebase project (or reuse `vibecare-494412`).
3. In the Firebase Console, enable **Authentication -> Sign-in method -> Google**.
4. Create **Firestore** in Native mode, region `asia-south1`.
5. Add a **Web App** under Project Settings, copy the SDK config object, and paste the values into `.env.local` (use `.env.local.example` as a template).
6. Get a Gemini API key at https://aistudio.google.com/apikey and add it to `.env.local` as `GEMINI_API_KEY`.
7. Run the dev server.
   ```bash
   npm run dev
   ```

Open http://localhost:3000.

## Deploy: Firebase App Hosting (recommended)

App Hosting builds and deploys directly from your GitHub branch.

```bash
npm install -g firebase-tools
firebase login
firebase init apphosting     # link to your GitHub repo + branch
```

Then in **Firebase Console -> App Hosting -> Secrets**, create the following secrets (names must match `apphosting.yaml`):

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `GEMINI_API_KEY`

Deploy Firestore rules.

```bash
firebase deploy --only firestore:rules
```

Push to the linked GitHub branch — App Hosting builds and deploys automatically.

## Deploy: Cloud Run (alternate)

If you prefer raw Cloud Run, the included `Dockerfile` builds a Next.js standalone image.

```bash
gcloud auth login
gcloud config set project vibecare-494412

gcloud builds submit --tag gcr.io/vibecare-494412/eventconnect

gcloud run deploy eventconnect \
  --image gcr.io/vibecare-494412/eventconnect \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars=GEMINI_API_KEY=...,\
NEXT_PUBLIC_FIREBASE_API_KEY=...,\
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...,\
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...,\
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...,\
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...,\
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

For production, prefer Secret Manager and `--set-secrets` over `--set-env-vars`.

## Project structure

```
src/
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx          # root layout, providers, top nav
│   └── page.tsx            # landing / dashboard
├── components/
│   └── top-nav.tsx         # header + auth button
└── lib/
    ├── auth-context.tsx    # React context for the signed-in user
    ├── firebase.ts         # client SDK init (Auth + Firestore)
    ├── firebase-admin.ts   # admin SDK init for server actions/route handlers
    ├── gemini.ts           # Gemini 2.0 Flash client + prompts
    └── types.ts            # shared types (UserProfile, Connection, ...)
```

## Demo script (90 seconds)

> *"At every conference you swap 30 business cards and forget all of them by Monday. EventConnect uses AI to tell you who actually matters, what to say, and writes the follow-up for you."*

**Beat 1 — sign in (10s).** Open the app, click *Continue with Google*. Profile loads instantly from Firestore.

**Beat 2 — show your badge (10s).** Tap *My Badge*. A QR code renders on screen — that's you.

**Beat 3 — scan a teammate (15s).** Tap *Scan*. Phone camera opens. Point it at a teammate's badge. The scan resolves their UID and pulls their profile from Firestore.

**Beat 4 — AI icebreaker (20s).** Gemini 2.0 Flash returns a match score (e.g. *"87/100 — both shipping AI tools for events"*) and a one-line opener referencing both profiles. Read it out loud.

**Beat 5 — save the connection (10s).** One tap. The connection is written to `connections/{cid}` with `ownerId = me`.

**Beat 6 — post-event follow-up (20s).** Open *Connections*. Tap *Generate follow-up* on the saved card. Gemini drafts a personalized DM referencing the original conversation context. Copy, paste, send. Done.

> *"Three taps to a real relationship. That's EventConnect."*

## What's next

- **BLE proximity** — auto-suggest matches when a high-affinity profile is in the same room.
- **Voice icebreakers** via Chirp — generate audio openers in the speaker's accent for hallway pitches.
- **Post-event analytics** — heatmap of who connected with whom, ROI dashboard for organizers.
- **Multi-language** via the Cloud Translation API — icebreakers and follow-ups in the recipient's language.
