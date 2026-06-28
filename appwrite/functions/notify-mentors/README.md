# notify-mentors (Appwrite Function)

Fans out an in-app notification to available, topic-matched mentors whenever a
new question is created.

## Deploy with the Appwrite CLI
```bash
npm i -g appwrite-cli
appwrite login
# from the repo root:
appwrite push functions          # uses appwrite.json at the repo root
```

## Or deploy from the console
1. Functions → Create function → Node 18.
2. Connect this repo (or upload this folder as a tarball).
3. Set entrypoint `src/main.js`, build command `npm install`.
4. Add the env vars listed at the top of `src/main.js` (including a secret
   `APPWRITE_API_KEY` with `databases.read` + `databases.write`).
5. Settings → Events → add:
   `databases.*.collections.questions.documents.*.create`

The `APPWRITE_API_KEY` is a **server secret**. It lives only in the function's
environment and must never be added to the mobile app or committed to git.
