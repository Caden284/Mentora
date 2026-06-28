// Create / list / search questions.
import { ID, Query, Permission, Role } from 'react-native-appwrite';
import { databases, appwriteConfig } from '@/lib/appwrite';
import type { Question, MediaType, UserProfile } from '@/types';
import { uploadMedia, getMediaUrl, LocalFile } from './storage';

const { databaseId, questionsCollectionId } = appwriteConfig;

function hydrate(doc: any): Question {
  return { ...doc, mediaUrl: getMediaUrl(doc.mediaFileId) } as Question;
}

export async function createQuestion(params: {
  author: UserProfile;
  title: string;
  body: string;
  topic: string;
  mediaType: MediaType;
  media?: LocalFile;
}): Promise<Question> {
  let mediaFileId: string | undefined;
  if (params.media && params.mediaType !== 'text') {
    mediaFileId = await uploadMedia(params.media);
  }

  const doc = await databases.createDocument(
    databaseId,
    questionsCollectionId,
    ID.unique(),
    {
      authorId: params.author.$id,
      authorName: params.author.name,
      title: params.title,
      body: params.body,
      topic: params.topic,
      mediaType: params.mediaType,
      mediaFileId: mediaFileId ?? null,
      status: 'open',
      answerCount: 0,
    },
    [
      Permission.read(Role.any()),
      Permission.update(Role.user(params.author.accountId)),
      Permission.delete(Role.user(params.author.accountId)),
    ],
  );
  return hydrate(doc);
}

export async function listQuestions(topic?: string): Promise<Question[]> {
  const queries = [Query.orderDesc('$createdAt'), Query.limit(50)];
  if (topic && topic !== 'All') queries.push(Query.equal('topic', topic));
  const res = await databases.listDocuments(
    databaseId,
    questionsCollectionId,
    queries,
  );
  return res.documents.map(hydrate);
}

export async function getQuestion(id: string): Promise<Question> {
  const doc = await databases.getDocument(databaseId, questionsCollectionId, id);
  return hydrate(doc);
}

// Knowledge-base search across answered questions. Uses Appwrite full-text
// search on title/body (requires fulltext indexes — see SCHEMA.md).
export async function searchKnowledgeBase(term: string): Promise<Question[]> {
  if (!term.trim()) {
    const res = await databases.listDocuments(databaseId, questionsCollectionId, [
      Query.equal('status', 'answered'),
      Query.orderDesc('$createdAt'),
      Query.limit(50),
    ]);
    return res.documents.map(hydrate);
  }
  const res = await databases.listDocuments(databaseId, questionsCollectionId, [
    Query.search('title', term),
    Query.limit(50),
  ]);
  return res.documents.map(hydrate);
}
