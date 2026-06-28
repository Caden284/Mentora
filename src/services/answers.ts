// Create / list answers, and mark a question answered.
import { ID, Query, Permission, Role } from 'react-native-appwrite';
import { databases, appwriteConfig } from '@/lib/appwrite';
import type { Answer, MediaType, UserProfile } from '@/types';
import { uploadMedia, getMediaUrl, LocalFile } from './storage';

const { databaseId, answersCollectionId, questionsCollectionId } = appwriteConfig;

function hydrate(doc: any): Answer {
  return { ...doc, mediaUrl: getMediaUrl(doc.mediaFileId) } as Answer;
}

export async function listAnswers(questionId: string): Promise<Answer[]> {
  const res = await databases.listDocuments(databaseId, answersCollectionId, [
    Query.equal('questionId', questionId),
    Query.orderDesc('upvotes'),
    Query.limit(50),
  ]);
  return res.documents.map(hydrate);
}

export async function createAnswer(params: {
  question: { $id: string; answerCount: number };
  mentor: UserProfile;
  body: string;
  mediaType: MediaType;
  media?: LocalFile;
}): Promise<Answer> {
  let mediaFileId: string | undefined;
  if (params.media && params.mediaType !== 'text') {
    mediaFileId = await uploadMedia(params.media);
  }

  const doc = await databases.createDocument(
    databaseId,
    answersCollectionId,
    ID.unique(),
    {
      questionId: params.question.$id,
      mentorId: params.mentor.$id,
      mentorName: params.mentor.name,
      body: params.body,
      mediaType: params.mediaType,
      mediaFileId: mediaFileId ?? null,
      upvotes: 0,
    },
    [
      Permission.read(Role.any()),
      Permission.update(Role.user(params.mentor.accountId)),
      Permission.delete(Role.user(params.mentor.accountId)),
    ],
  );

  // Mark the question answered + bump count. The asker granted update to
  // Role.users via collection permission so any mentor can increment it.
  await databases.updateDocument(
    databaseId,
    questionsCollectionId,
    params.question.$id,
    { status: 'answered', answerCount: params.question.answerCount + 1 },
  );

  return hydrate(doc);
}

export async function upvoteAnswer(answer: Answer): Promise<Answer> {
  const doc = await databases.updateDocument(
    databaseId,
    answersCollectionId,
    answer.$id,
    { upvotes: answer.upvotes + 1 },
  );
  return hydrate(doc);
}
