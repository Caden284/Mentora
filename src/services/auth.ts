// Authentication + profile bootstrap.
import { ID, Query } from 'react-native-appwrite';
import { account, databases, avatars, appwriteConfig } from '@/lib/appwrite';
import type { UserProfile } from '@/types';

const { databaseId, usersCollectionId } = appwriteConfig;

export async function register(
  email: string,
  password: string,
  name: string,
): Promise<UserProfile> {
  const newAccount = await account.create(ID.unique(), email, password, name);
  // Create a session so the next calls are authenticated.
  await account.createEmailPasswordSession(email, password);

  const avatarUrl = avatars.getInitials(name).toString();

  const profile = await databases.createDocument(
    databaseId,
    usersCollectionId,
    ID.unique(),
    {
      accountId: newAccount.$id,
      name,
      email,
      avatarUrl,
      isMentor: false,
      isAvailable: false,
      expertise: [],
      bio: '',
    },
  );
  return profile as unknown as UserProfile;
}

export async function login(email: string, password: string) {
  return account.createEmailPasswordSession(email, password);
}

export async function logout() {
  return account.deleteSession('current');
}

// Returns the signed-in user's profile document, or null if not logged in.
export async function getCurrentProfile(): Promise<UserProfile | null> {
  try {
    const current = await account.get();
    const res = await databases.listDocuments(databaseId, usersCollectionId, [
      Query.equal('accountId', current.$id),
      Query.limit(1),
    ]);
    if (res.documents.length === 0) return null;
    return res.documents[0] as unknown as UserProfile;
  } catch {
    return null;
  }
}

export async function updateProfile(
  profileId: string,
  data: Partial<
    Pick<UserProfile, 'isMentor' | 'isAvailable' | 'expertise' | 'bio' | 'name'>
  >,
): Promise<UserProfile> {
  const updated = await databases.updateDocument(
    databaseId,
    usersCollectionId,
    profileId,
    data,
  );
  return updated as unknown as UserProfile;
}
