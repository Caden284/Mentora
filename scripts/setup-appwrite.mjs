/**
 * One-shot Appwrite provisioner for Mentora.
 *
 * Creates the database, collections, attributes, indexes, and storage bucket
 * described in appwrite/SCHEMA.md so you don't have to click through the
 * console. Safe to re-run: it ignores "already exists" (409) errors.
 *
 * Usage:
 *   1) npm i -D node-appwrite dotenv
 *   2) Create a server API key in Appwrite (Scopes: databases.*, collections.*,
 *      attributes.*, indexes.*, buckets.*). Then:
 *
 *   APPWRITE_ENDPOINT="https://fra.cloud.appwrite.io/v1" \
 *   APPWRITE_PROJECT_ID="xxx" \
 *   APPWRITE_API_KEY="yyy" \
 *   node scripts/setup-appwrite.mjs
 */
import {
  Client,
  Databases,
  Storage,
  Permission,
  Role,
  ID,
  IndexType,
} from 'node-appwrite';

const endpoint = process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

if (!projectId || !apiKey) {
  console.error('Set APPWRITE_PROJECT_ID and APPWRITE_API_KEY env vars.');
  process.exit(1);
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const db = new Databases(client);
const storage = new Storage(client);

const DB = 'mentora';
const ok = async (label, fn) => {
  try {
    await fn();
    console.log('  ✓', label);
  } catch (e) {
    if (e.code === 409) console.log('  · exists:', label);
    else throw e;
  }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log('Database');
  await ok('database mentora', () => db.create(DB, 'Mentora'));

  const rwUsers = [
    Permission.read(Role.any()),
    Permission.create(Role.users()),
    Permission.update(Role.users()),
    Permission.delete(Role.users()),
  ];

  // ---- users ----
  console.log('Collection: users');
  await ok('create users', () => db.createCollection(DB, 'users', 'users', rwUsers, true));
  await ok('users.accountId', () => db.createStringAttribute(DB, 'users', 'accountId', 64, true));
  await ok('users.name', () => db.createStringAttribute(DB, 'users', 'name', 128, true));
  await ok('users.email', () => db.createStringAttribute(DB, 'users', 'email', 256, true));
  await ok('users.avatarUrl', () => db.createStringAttribute(DB, 'users', 'avatarUrl', 512, false));
  await ok('users.isMentor', () => db.createBooleanAttribute(DB, 'users', 'isMentor', false, false));
  await ok('users.isAvailable', () => db.createBooleanAttribute(DB, 'users', 'isAvailable', false, false));
  await ok('users.expertise', () => db.createStringAttribute(DB, 'users', 'expertise', 32, false, undefined, true));
  await ok('users.bio', () => db.createStringAttribute(DB, 'users', 'bio', 1000, false));
  await sleep(1500);
  await ok('idx users.accountId', () => db.createIndex(DB, 'users', 'idx_accountId', IndexType.Key, ['accountId']));
  await ok('idx users.isMentor', () => db.createIndex(DB, 'users', 'idx_isMentor', IndexType.Key, ['isMentor']));
  await ok('idx users.isAvailable', () => db.createIndex(DB, 'users', 'idx_isAvailable', IndexType.Key, ['isAvailable']));

  // ---- questions ----
  console.log('Collection: questions');
  await ok('create questions', () => db.createCollection(DB, 'questions', 'questions', rwUsers, true));
  await ok('questions.authorId', () => db.createStringAttribute(DB, 'questions', 'authorId', 64, true));
  await ok('questions.authorName', () => db.createStringAttribute(DB, 'questions', 'authorName', 128, true));
  await ok('questions.title', () => db.createStringAttribute(DB, 'questions', 'title', 200, true));
  await ok('questions.body', () => db.createStringAttribute(DB, 'questions', 'body', 5000, false));
  await ok('questions.topic', () => db.createStringAttribute(DB, 'questions', 'topic', 32, true));
  await ok('questions.mediaType', () => db.createEnumAttribute(DB, 'questions', 'mediaType', ['text', 'audio', 'video'], true));
  await ok('questions.mediaFileId', () => db.createStringAttribute(DB, 'questions', 'mediaFileId', 64, false));
  await ok('questions.status', () => db.createEnumAttribute(DB, 'questions', 'status', ['open', 'answered'], true));
  await ok('questions.answerCount', () => db.createIntegerAttribute(DB, 'questions', 'answerCount', false, 0));
  await sleep(1500);
  await ok('idx questions.topic', () => db.createIndex(DB, 'questions', 'idx_topic', IndexType.Key, ['topic']));
  await ok('idx questions.status', () => db.createIndex(DB, 'questions', 'idx_status', IndexType.Key, ['status']));
  await ok('idx questions.created', () => db.createIndex(DB, 'questions', 'idx_created', IndexType.Key, ['$createdAt'], ['DESC']));
  await ok('idx questions.title fulltext', () => db.createIndex(DB, 'questions', 'idx_title_ft', IndexType.Fulltext, ['title']));
  await ok('idx questions.body fulltext', () => db.createIndex(DB, 'questions', 'idx_body_ft', IndexType.Fulltext, ['body']));

  // ---- answers ----
  console.log('Collection: answers');
  await ok('create answers', () => db.createCollection(DB, 'answers', 'answers', rwUsers, true));
  await ok('answers.questionId', () => db.createStringAttribute(DB, 'answers', 'questionId', 64, true));
  await ok('answers.mentorId', () => db.createStringAttribute(DB, 'answers', 'mentorId', 64, true));
  await ok('answers.mentorName', () => db.createStringAttribute(DB, 'answers', 'mentorName', 128, true));
  await ok('answers.body', () => db.createStringAttribute(DB, 'answers', 'body', 5000, false));
  await ok('answers.mediaType', () => db.createEnumAttribute(DB, 'answers', 'mediaType', ['text', 'audio', 'video'], true));
  await ok('answers.mediaFileId', () => db.createStringAttribute(DB, 'answers', 'mediaFileId', 64, false));
  await ok('answers.upvotes', () => db.createIntegerAttribute(DB, 'answers', 'upvotes', false, 0));
  await sleep(1500);
  await ok('idx answers.questionId', () => db.createIndex(DB, 'answers', 'idx_questionId', IndexType.Key, ['questionId']));
  await ok('idx answers.upvotes', () => db.createIndex(DB, 'answers', 'idx_upvotes', IndexType.Key, ['upvotes'], ['DESC']));

  // ---- notifications (optional) ----
  console.log('Collection: notifications');
  await ok('create notifications', () => db.createCollection(DB, 'notifications', 'notifications', rwUsers, true));
  await ok('notifications.recipientId', () => db.createStringAttribute(DB, 'notifications', 'recipientId', 64, true));
  await ok('notifications.questionId', () => db.createStringAttribute(DB, 'notifications', 'questionId', 64, true));
  await ok('notifications.title', () => db.createStringAttribute(DB, 'notifications', 'title', 200, true));
  await ok('notifications.body', () => db.createStringAttribute(DB, 'notifications', 'body', 200, false));
  await ok('notifications.read', () => db.createBooleanAttribute(DB, 'notifications', 'read', false, false));
  await sleep(1500);
  await ok('idx notifications.recipientId', () => db.createIndex(DB, 'notifications', 'idx_recipient', IndexType.Key, ['recipientId']));

  // ---- storage ----
  console.log('Storage');
  await ok('bucket media', () =>
    storage.createBucket(
      'media',
      'media',
      [Permission.read(Role.any()), Permission.create(Role.users())],
      false,
      true,
      50 * 1024 * 1024,
      ['m4a', 'mp3', 'wav', 'mp4', 'mov'],
    ),
  );

  console.log('\nDone. Mentora backend is provisioned ✅');
}

main().catch((e) => {
  console.error('\nSetup failed:', e.message);
  process.exit(1);
});
