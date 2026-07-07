# Building a Mobile App, Explained — Using Mentora as the Example

This is a top-to-bottom guide to how a modern mobile app is built, using the
Mentora codebase you just shipped as the running example. It assumes you can
program a little but have never built a full app. Read it start to finish once,
then keep it open as a reference while you poke at the code.

---

## Part 1 — The mental model: what an app actually is

Almost every app you use is really **two programs talking to each other**:

1. **The client** — the thing installed on your phone. It draws the screens,
   reacts to taps, and shows data. In Mentora this is the React Native app in
   `app/` and `src/`.
2. **The backend** — a program running on a server somewhere that stores data,
   checks who you are, and enforces rules. In Mentora this is **Appwrite**.

They talk over the internet using **HTTP requests** (the client asks, the
backend answers, usually in JSON). The client never trusts itself with the
"source of truth" — the backend owns the real data and decides who's allowed to
do what.

A useful way to picture the whole system:

```
   ┌─────────────────────┐        HTTPS         ┌──────────────────────────┐
   │   YOUR PHONE         │  ───── requests ───▶ │   APPWRITE (backend)     │
   │                      │                      │                          │
   │  React Native UI     │ ◀──── responses ──── │  • Auth (accounts)       │
   │  (screens, buttons)  │                      │  • Databases (Q&A, users)│
   │                      │                      │  • Storage (audio/video) │
   │  services/*.ts  ─────┼──────────────────────┤  • Functions (notify)    │
   └─────────────────────┘                      └──────────────────────────┘
```

Everything else in this guide is just detail hung on that skeleton.

---

## Part 2 — The stack, and why each piece was chosen

| Need | Tool in Mentora | Why |
|------|-----------------|-----|
| Build one app for iOS **and** Android | **React Native** | Write in JavaScript/TypeScript once, run on both phones. |
| Make React Native painless to run | **Expo** | Handles the native build plumbing; run on a real phone by scanning a QR code. |
| Move between screens | **expo-router** | "File-based routing" — a file in `app/` *is* a screen. |
| Catch mistakes before they run | **TypeScript** | Adds types to JavaScript so the editor warns you when something's wrong. |
| Accounts, database, files, server code | **Appwrite** | One free backend that does auth + database + storage + serverless functions. |
| Record audio / pick video | **expo-av**, **expo-image-picker** | Bundled Expo modules for microphone and media library. |
| Store the code + history | **Git + GitHub** | Version control; every change is saved and shareable. |

The theme running through these choices: **maximize what you get for free and
minimize the number of moving parts.** One language (TypeScript), one backend
(Appwrite), one way to build (Expo).

---

## Part 3 — A tour of the codebase, folder by folder

```
Mentora/
├── app/                     ← every screen (expo-router turns files into routes)
│   ├── _layout.tsx          ← the app shell; decides logged-in vs logged-out
│   ├── index.tsx            ← entry redirect
│   ├── (auth)/              ← sign-in / sign-up screens
│   ├── (tabs)/              ← the 5 bottom-tab screens
│   └── question/[id].tsx    ← one question's detail page
├── src/
│   ├── lib/appwrite.ts      ← configures the connection to Appwrite (one place)
│   ├── context/AuthContext  ← "who is logged in" shared across the whole app
│   ├── services/            ← all backend calls live here (auth, questions, …)
│   ├── components/          ← reusable UI pieces (buttons, cards, avatars)
│   ├── constants/           ← colors, spacing, the list of topics
│   └── types/               ← shared TypeScript shapes (Question, Answer, …)
├── appwrite/
│   ├── SCHEMA.md            ← the database design, written down
│   └── functions/notify-mentors  ← server code that runs on an event
├── scripts/setup-appwrite.mjs    ← creates the whole backend in one command
├── app.json                 ← app name, icon, permissions, config
├── package.json             ← the list of libraries the app depends on
└── .env                     ← your secret-ish project IDs (never committed)
```

The single most important idea in this structure: **screens don't talk to the
backend directly.** A screen calls a function in `src/services/`, and that
function talks to Appwrite. This "separation of concerns" means if Appwrite ever
changes, you fix it in one folder, not in twenty screens.

---

## Part 4 — React fundamentals (the 20% you use 80% of the time)

React Native builds screens out of **components** — small functions that return
what to draw. Here's the whole idea in one tiny example from the codebase
(`src/components/Badge.tsx`, simplified):

```tsx
function Badge({ label }) {
  return (
    <View style={styles.base}>
      <Text>{label}</Text>
    </View>
  );
}
```

Three concepts explain almost everything:

**Components** are reusable Lego bricks. `Badge`, `Avatar`, `QuestionCard` are
all components. Bigger components are built out of smaller ones — a
`QuestionCard` contains an `Avatar` and a `Badge`.

**Props** are the inputs you pass in, like function arguments. `<Badge
label="Answered" />` passes the prop `label`. This is how a parent hands data
down to a child.

**State** is data that can change over time and, when it changes, redraws the
screen. You create it with `useState`:

```tsx
const [loading, setLoading] = useState(true);
// reading `loading` shows the current value;
// calling `setLoading(false)` changes it AND re-renders the screen.
```

Look at `app/(tabs)/index.tsx` (the feed). It holds three pieces of state:
`questions` (the list to show), `filter` (which topic tab is selected), and
`loading` (whether to show a spinner). When any of them changes, the feed
redraws itself. That's the entire React loop: **state changes → UI updates.**

One more you'll see everywhere: **`useEffect` / `useFocusEffect`** run code *at
the right moment* — e.g. "when this screen appears, fetch the questions." The
feed uses `useFocusEffect` so the list refreshes every time you navigate back to
it.

---

## Part 5 — Navigation: how tapping moves between screens

Mentora uses **expo-router**, where the folder layout *is* the navigation map:

- `app/(auth)/sign-in.tsx` → the route `/sign-in`
- `app/(tabs)/index.tsx` → the Feed tab
- `app/question/[id].tsx` → `/question/123` (the `[id]` is a **dynamic**
  parameter — any id fills it in)

Parentheses like `(tabs)` are **groups**: they organize files without adding a
segment to the URL. `(tabs)/_layout.tsx` defines the bottom tab bar;
`(auth)/_layout.tsx` defines the sign-in stack.

To move around you either render a `<Link href="/sign-up">` or call
`router.push('/question/' + id)` in code. Look at `QuestionCard` — tapping it
calls `router.push(\`/question/\${item.$id}\`)`, which opens the detail screen
for that specific question.

**The auth gate.** `app/_layout.tsx` is the app's front door. It reads "is
someone logged in?" from the AuthContext and redirects:

```tsx
if (!isLoggedIn && !inAuthGroup) router.replace('/(auth)/sign-in');
else if (isLoggedIn && inAuthGroup) router.replace('/(tabs)');
```

So a logged-out user can only reach the auth screens, and a logged-in user is
pushed into the tabs. This one file is why you never see the feed before signing
in.

---

## Part 6 — Global state: "who is logged in?"

Many screens need to know the current user (the feed greets you by name, Profile
shows your details, the answer box only appears for mentors). Passing that user
down through every component by hand would be miserable. React's answer is
**Context** — a value any component can read directly.

`src/context/AuthContext.tsx` creates one. It:

- loads the current profile when the app starts,
- exposes `signIn`, `signUp`, `signOut`, and the `profile` object,
- and wraps the whole app (in `_layout.tsx`) so anyone can call
  `const { profile } = useAuth();`.

This is a common pattern: **one source of truth for a cross-cutting concern,
shared through Context.** Auth is the classic example.

---

## Part 7 — The service layer: every backend call in one place

Open `src/services/`. Each file is a thin wrapper around Appwrite for one topic:

- `auth.ts` — register, login, logout, load/update profile
- `questions.ts` — create, list, get, and **search** questions
- `answers.ts` — list and post answers, mark a question answered, upvote
- `mentors.ts` — list mentors (optionally only available ones)
- `storage.ts` — upload audio/video and build a URL to play it back

Here's the shape of a real one (`questions.ts`, trimmed):

```ts
export async function listQuestions(topic?: string): Promise<Question[]> {
  const queries = [Query.orderDesc('$createdAt'), Query.limit(50)];
  if (topic && topic !== 'All') queries.push(Query.equal('topic', topic));
  const res = await databases.listDocuments(databaseId, questionsCollectionId, queries);
  return res.documents.map(hydrate);
}
```

Notice: the screen just calls `listQuestions('Coding')` and gets back typed
`Question[]`. It has no idea what Appwrite is. That's the payoff of the service
layer — **screens stay simple, backend details stay contained.**

`async`/`await` shows up constantly here. Talking to a server takes time, so
these functions are *asynchronous*: `await` means "pause here until the server
answers, without freezing the app."

---

## Part 8 — The backend: what Appwrite gives you

Appwrite is four services in one, and Mentora uses all four:

**Auth (Accounts).** `account.create(...)` makes a user; `createEmailPasswordSession(...)`
logs them in and stores a session token so future requests are "signed in."
Passwords are hashed and handled by Appwrite — you never see or store them.

**Databases.** Data lives in **collections** (like tables) made of **documents**
(like rows). Mentora has `users`, `questions`, `answers`, and `notifications`.
Each collection has typed **attributes** (fields) and **indexes** (which make
queries fast and enable search). The full design is written in
`appwrite/SCHEMA.md` — writing your data model down before coding is a
professional habit worth copying.

**Storage.** Files (audio and video clips) go in a **bucket** called `media`.
`storage.ts` uploads the file and returns an id; to play it back the app builds a
`/view` URL from that id.

**Functions.** Small programs that run *on the server* in response to events —
covered next.

A subtle but crucial point: **the app ships with only public identifiers** (the
project id and endpoint, prefixed `EXPO_PUBLIC_`). The powerful secret API key
is used *only once*, by you, when running the setup script — it never goes into
the app. Secrets on a phone can be extracted by anyone, so they must stay on the
server.

---

## Part 9 — Following one feature end to end: "Ask a question"

This ties every layer together. When you tap **Post question**:

1. **UI** — `app/(tabs)/ask.tsx` holds your title, body, topic, and chosen media
   in state. On submit it validates (is there a title? if audio, is a clip
   attached?).
2. **Service** — it calls `createQuestion(...)` in `services/questions.ts`.
3. **Storage** — if you attached audio/video, `createQuestion` first calls
   `uploadMedia(...)` (in `storage.ts`), which pushes the file to the Appwrite
   `media` bucket and gets back a file id.
4. **Database** — it then creates a document in the `questions` collection with
   your text, topic, media id, and `status: 'open'`. It also attaches
   **permissions**: anyone can read it, but only you can edit or delete it.
5. **Back to UI** — the new question comes back, and the screen calls
   `router.push('/question/<newId>')` to show it.
6. **Server reacts** — creating that document fires an event. The
   `notify-mentors` **Function** wakes up, finds available mentors whose
   expertise matches the topic, and writes them a notification. You didn't call
   it; the database event did.

That is the anatomy of essentially every feature: **UI → service → (storage) →
database → UI**, occasionally with a **server function** reacting to the change.
Search, answering, and upvoting all follow the same path with different
collections.

---

## Part 10 — Permissions and security (the part beginners skip and regret)

Never trust the client. A determined user can send any request they want, so the
**backend** must enforce the rules. Appwrite does this with permissions at two
levels:

- **Collection level** (set in the setup script): e.g. anyone can *read*
  questions, but only logged-in *users* can *create* them.
- **Document level** (set when creating): a question grants *update/delete* only
  to its author's account. That's why one person can't delete another's question
  even though the app UI would never offer the button.

The rule of thumb: **the UI hides things for convenience; the backend forbids
things for safety.** Both matter, but only the backend is real security.

---

## Part 11 — Serverless functions: code that runs on events

`appwrite/functions/notify-mentors/src/main.js` is a small Node program that runs
**on Appwrite's servers**, not on the phone. It's wired to the event
"a document was created in `questions`." When that happens Appwrite runs the
function, handing it the new question. The function queries for available,
matching mentors and writes a notification document for each.

Why do this on the server instead of in the app? Because the phone that posted
the question shouldn't be responsible for notifying strangers, and because the
work should happen even if that phone immediately closes the app.
**Event-driven server functions** are how you run trusted background work.
Later you'd swap the "write a notification doc" step for "send a push
notification or email" without touching the app at all.

---

## Part 12 — Configuration and environments

Two files control configuration:

- **`app.json`** — the app's identity: name, icon, the permission prompts for
  camera/mic, the bundle ids. Expo reads this when building.
- **`.env`** — your Appwrite endpoint and project id. It's listed in
  `.gitignore` so it never gets committed. Anything prefixed `EXPO_PUBLIC_` is
  readable by the app at runtime via `process.env.EXPO_PUBLIC_...`, which is how
  `src/lib/appwrite.ts` finds your project.

The habit to internalize: **config and secrets live outside the code**, so the
same code can point at a test backend today and a production backend tomorrow by
changing one file.

---

## Part 13 — Running, debugging, and iterating

Day-to-day loop:

```bash
npx expo start        # starts the dev server + QR code
```

Then press `r` to reload, or just save a file — Expo **hot-reloads** so your
change shows on the phone in a second or two. When something breaks:

- Red error screen on the phone → read the top line; it usually names the file
  and line.
- `console.warn(...)` / `console.log(...)` output appears in the terminal
  running Expo. The services already log failures this way.
- If the app can't reach the backend, 90% of the time `.env` has the wrong
  project id or you didn't restart after editing it.

---

## Part 14 — Shipping to the App Store / Play Store (later)

Development runs through Expo Go. To publish a standalone app you use **EAS**
(Expo Application Services):

```bash
npm i -g eas-cli
eas login
eas build:configure
eas build --platform android      # or ios — builds in the cloud
eas submit                        # uploads to the store
```

The code doesn't change; EAS compiles it into a real `.apk`/`.ipa`. The only
costs are the one-time developer fees (Apple $99/yr, Google $25 once).

---

## Part 15 — How to add a feature (a worked recipe)

Say you want a **"my notifications" screen**. The path mirrors everything above:

1. **Data** — you already have a `notifications` collection. Confirm its shape in
   `SCHEMA.md`.
2. **Service** — add `services/notifications.ts` with
   `listNotifications(profileId)` that queries the collection by `recipientId`.
3. **Screen** — add `app/(tabs)/notifications.tsx` (or a route), give it
   `useState` for the list and `useFocusEffect` to load it, and render each with
   a small component.
4. **Navigation** — add a `<Tabs.Screen name="notifications" ... />` entry in
   `(tabs)/_layout.tsx`.
5. **Permissions** — make sure the collection lets a user read their own docs.

Every new feature is that same five-step shape: **model the data, write a
service, build the screen, wire up navigation, check permissions.** Once this
rhythm feels automatic, you can build almost anything.

---

## Part 16 — Glossary

- **Client / frontend** — the app on the phone.
- **Backend** — the server that owns data and rules (Appwrite).
- **Component** — a reusable piece of UI (a function returning what to draw).
- **Props** — inputs passed into a component.
- **State** — changeable data that redraws the UI when it changes.
- **Hook** — a `use...` function (`useState`, `useEffect`) that adds a capability
  to a component.
- **Route** — a screen, defined by a file in `app/`.
- **Service** — a function that wraps a backend call.
- **Collection / document / attribute** — table / row / column, in Appwrite.
- **Index** — backend structure that makes queries fast and enables search.
- **Permission** — a rule for who can read/write a piece of data.
- **Function (serverless)** — code that runs on the server in response to an event.
- **Async / await** — how the app waits for the network without freezing.
- **Environment variable** — configuration kept outside the code (`.env`).

---

## Part 17 — Where to go next

- **React / React Native basics** — react.dev/learn (the "Thinking in React"
  and "State" sections map directly onto Part 4 above).
- **Expo & expo-router** — docs.expo.dev.
- **Appwrite** — appwrite.io/docs (read the Databases, Storage, and Functions
  guides; they mirror Parts 8–11).
- **The best teacher is this repo.** Pick one small change — a new topic, a
  different color in `constants/theme.ts`, an extra field on a mentor — and make
  it end to end. Understanding compounds fastest when you break something and fix
  it.

You now have a real, deployed app and a map of how every part fits together.
That combination — a working example plus the mental model behind it — is
exactly how professional developers ramp onto any new codebase.
