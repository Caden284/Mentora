// Mentor directory queries.
import { Query } from 'react-native-appwrite';
import { databases, appwriteConfig } from '@/lib/appwrite';
import type { UserProfile } from '@/types';

const { databaseId, usersCollectionId } = appwriteConfig;

export async function listMentors(onlyAvailable = false): Promise<UserProfile[]> {
  const queries = [Query.equal('isMentor', true), Query.limit(100)];
  if (onlyAvailable) queries.push(Query.equal('isAvailable', true));
  const res = await databases.listDocuments(
    databaseId,
    usersCollectionId,
    queries,
  );
  return res.documents as unknown as UserProfile[];
}
