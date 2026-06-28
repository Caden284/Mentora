# Mentora

A micro-mentoring mobile app. Mentees post questions (text, audio, or video);
mentors answer asynchronously when they're free. Every answered question becomes
part of a searchable knowledge base.

Built with **React Native (Expo SDK 54)** + **Appwrite Cloud** (free tier).

---

## Features

- **Email/password auth** with an auto-created profile (Appwrite Account + `users` collection).
- **Asynchronous Q&A** — ask in text, recorded **audio**, or uploaded **video**; mentors reply on their own schedule.
- **Searchable knowledge base** — full-text search across answered questions.
- **Mentor management** — become a mentor, set expertise tags, write a bio, and flip an **available / away** toggle.
- **Peer review (v1)** — upvotes on answers, sorted best-first.
- **Notifications** — an Appwrite Function fans out alerts to matching, available mentors on each new question.

## Tech stack (all free / student-friendly)

| Layer | Tool |
|-------|------|
| Mobile UI | React Native + Expo (expo-router, TypeScript) |
| Auth / DB / Storage / Functions | Appwrite Cloud free tier |
| Media | expo-image-picker (video), expo-av (audio record + playback) |
| Version control | GitHub |
| Build / OTA | EAS Build + Expo Go for dev |

---

## 1. Prerequisites

- Node.js 18+ and npm
- The **Expo Go** app on your phone (iOS/Android), or an emulator
- A free **Appwrite Cloud** account → <https://cloud.appwrite.io>

## 2. Install

```bash
git clone https://github.com/Caden284/Mentora.git
cd Mentora
npm install
# reconcile native package versions to your installed Expo SDK:
npx expo install --fix
```

## 3. Create the Appwrite project

1. In the Appwrite console, **create a project**. Copy its **Project ID** and the
   **API endpoint** (e.g. `https://fra.cloud.appwrite.io/v1`).
2. Add a platform: **Settings → Platforms → Add platform → React Native**,
   bundle/package id `com.mentora.app`.

## 4. Provision the backend (one command)

Create a temporary **API key** (Overview → Integrations → API Keys) with scopes
`databases.*`, `collections.*`, `attributes.*`, `indexes.*`, `buckets.*`, then:

```bash
npm i -D node-appwrite
APPWRITE_ENDPOINT="https://fra.cloud.appwrite.io/v1" \
APPWRITE_PROJECT_ID="<your-project-id>" \
APPWRITE_API_KEY="<your-temp-key>" \
node scripts/setup-appwrite.mjs
```

This creates the `mentora` database, all collections + attributes + indexes
(including the full-text search indexes), and the `media` storage bucket. It's
safe to re-run. **Delete the API key afterward** — the app never needs it.

> Prefer clicking? `appwrite/SCHEMA.md` documents every collection so you can
> build it by hand.

## 5. Configure the app

```bash
cp .env.example .env
```

Fill in `.env`:

```
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=<your-project-id>
EXPO_PUBLIC_APPWRITE_PLATFORM=com.mentora.app
```

The other `EXPO_PUBLIC_*` ids already match what the setup script creates.
These are public client identifiers (not secrets) — safe to ship in the bundle.

## 6. Run

```bash
npx expo start
```

Scan the QR code with Expo Go. Create an account, post a question, then open
**Profile → Become a mentor** to answer it and watch it move into Search.

---

## 7. Deploy the notification Function

```bash
npm i -g appwrite-cli
appwrite login
appwrite push functions      # reads appwrite.json (set your projectId first)
```

Then add a secret env var `APPWRITE_API_KEY` (scopes `databases.read` +
`databases.write`) to the function in the console. See
`appwrite/functions/notify-mentors/README.md`. The function is triggered by the
event `databases.*.collections.questions.documents.*.create`.

---

## 8. Ship to app stores (later)

```bash
npm i -g eas-cli
eas login
eas build:configure
eas build --platform android   # or ios
eas submit                     # uploads to Play Console / App Store Connect
```

Expo's free tier gives you cloud builds; you only pay the one-time Apple ($99/yr)
and Google ($25) developer fees when you publish publicly.

---

## Project structure

```
app/                      expo-router screens (file-based routing)
  _layout.tsx             root: auth provider + auth-gated navigation
  (auth)/                 sign-in, sign-up
  (tabs)/                 feed, search, ask, mentors, profile
  question/[id].tsx       question detail + answers + composer
src/
  lib/appwrite.ts         Appwrite client + config
  context/AuthContext.tsx global auth state
  services/               auth, questions, answers, mentors, storage
  components/             reusable UI (cards, buttons, media player/picker)
  constants/              theme tokens + topic taxonomy
  types/                  shared domain types
appwrite/
  SCHEMA.md               data model reference
  functions/notify-mentors/   the notification Function
scripts/setup-appwrite.mjs     one-shot backend provisioner
```

---

## Roadmap → scaling these features

- **Peer review v2** — add an `accepted` flag on answers writable only by the
  asker; weight knowledge-base ranking by `upvotes + accepted`.
- **Premium** — gate "priority" questions or 1:1 sessions behind a `plan` field
  on `users`; verify purchases with RevenueCat (free up to $2.5k/mo) and store
  entitlements in Appwrite.
- **Real-time** — swap the manual refreshes for Appwrite Realtime
  (`client.subscribe`) so feeds and answers update live.
- **Push notifications** — extend `notify-mentors` to call Expo Push or Appwrite
  Messaging instead of writing in-app notification docs.

---

## Two-person Git workflow

- `main` is always releasable; never push directly to it.
- Branch per task: `feature/ask-screen`, `fix/search-index`.
- Open a PR, request your partner's review, squash-merge.
- Keep `.env` out of git (it's already in `.gitignore`); share secrets over a
  password manager, not chat.
