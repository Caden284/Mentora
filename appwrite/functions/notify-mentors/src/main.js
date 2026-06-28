// Appwrite Function — notify-mentors
// -----------------------------------------------------------------------------
// Trigger: Database event  databases.*.collections.questions.documents.*.create
// Runtime: Node 18+
//
// When a mentee posts a question, this function finds mentors who are marked
// available and whose expertise matches the question topic, then records an
// in-app notification document for each. (Swap the notify() body for email /
// push later — see README "Scaling".)
//
// Required environment variables (set in the Appwrite console, NOT in the app):
//   APPWRITE_FUNCTION_API_ENDPOINT   (auto-provided by Appwrite)
//   APPWRITE_FUNCTION_PROJECT_ID     (auto-provided by Appwrite)
//   APPWRITE_API_KEY                 secret key with databases.read/write scope
//   DATABASE_ID                      e.g. "mentora"
//   USERS_COLLECTION_ID              e.g. "users"
//   NOTIFICATIONS_COLLECTION_ID      e.g. "notifications"  (optional)
import { Client, Databases, Query, ID } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  try {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const db = new Databases(client);
    const DATABASE_ID = process.env.DATABASE_ID || 'mentora';
    const USERS = process.env.USERS_COLLECTION_ID || 'users';
    const NOTIFS = process.env.NOTIFICATIONS_COLLECTION_ID || 'notifications';

    // The triggering question document is delivered as the request body.
    const question = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.bodyRaw || '{}');
    if (!question || !question.$id) {
      log('No question payload; nothing to do.');
      return res.json({ ok: true, skipped: true });
    }

    log(`New question ${question.$id} on topic "${question.topic}".`);

    // Find available mentors (optionally matching expertise on the topic).
    const mentorsRes = await db.listDocuments(DATABASE_ID, USERS, [
      Query.equal('isMentor', true),
      Query.equal('isAvailable', true),
      Query.limit(100),
    ]);

    const matched = mentorsRes.documents.filter(
      (m) =>
        !Array.isArray(m.expertise) ||
        m.expertise.length === 0 ||
        m.expertise.includes(question.topic),
    );

    log(`Matched ${matched.length} available mentor(s).`);

    let notified = 0;
    for (const mentor of matched) {
      try {
        await db.createDocument(DATABASE_ID, NOTIFS, ID.unique(), {
          recipientId: mentor.$id,
          questionId: question.$id,
          title: `New ${question.topic} question`,
          body: question.title,
          read: false,
        });
        notified += 1;
      } catch (e) {
        // Notifications collection is optional; don't fail the whole run.
        error(`Could not write notification for ${mentor.$id}: ${e.message}`);
      }
    }

    return res.json({ ok: true, matched: matched.length, notified });
  } catch (e) {
    error(`notify-mentors failed: ${e.message}`);
    return res.json({ ok: false, error: e.message }, 500);
  }
};
