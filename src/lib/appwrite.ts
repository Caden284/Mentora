// Single source of truth for the Appwrite client + config.
//
// Config is read from EXPO_PUBLIC_* env vars (see .env.example). These are
// public client identifiers, not secrets, so it is safe to ship them in the
// app bundle. Sensitive operations are protected by Appwrite permissions and
// server-side Functions (which use a secret API key that NEVER ships here).
import 'react-native-url-polyfill/auto';
import {
  Client,
  Account,
  Databases,
  Storage,
  Avatars,
} from 'react-native-appwrite';

const endpoint =
  process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ?? 'https://fra.cloud.appwrite.io/v1';
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID ?? '';
const platform = process.env.EXPO_PUBLIC_APPWRITE_PLATFORM ?? 'com.mentora.app';

export const appwriteConfig = {
  endpoint,
  projectId,
  platform,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID ?? 'mentora',
  usersCollectionId:
    process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID ?? 'users',
  questionsCollectionId:
    process.env.EXPO_PUBLIC_APPWRITE_QUESTIONS_COLLECTION_ID ?? 'questions',
  answersCollectionId:
    process.env.EXPO_PUBLIC_APPWRITE_ANSWERS_COLLECTION_ID ?? 'answers',
  mediaBucketId:
    process.env.EXPO_PUBLIC_APPWRITE_MEDIA_BUCKET_ID ?? 'media',
};

if (!projectId) {
  // Helps beginners diagnose a blank/erroring app fast.
  console.warn(
    '[Mentora] EXPO_PUBLIC_APPWRITE_PROJECT_ID is empty. ' +
      'Copy .env.example to .env and fill in your Appwrite project id.',
  );
}

export const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
