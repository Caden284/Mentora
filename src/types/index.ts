// Shared domain types. These mirror the Appwrite collections documented in
// appwrite/SCHEMA.md.

export interface UserProfile {
  $id: string;
  accountId: string;       // Appwrite Account $id
  name: string;
  email: string;
  avatarUrl?: string;
  isMentor: boolean;
  isAvailable: boolean;    // mentor availability toggle
  expertise: string[];     // tags, e.g. ["React Native", "Career"]
  bio?: string;
  $createdAt?: string;
}

export type MediaType = 'text' | 'audio' | 'video';

export interface Question {
  $id: string;
  authorId: string;        // UserProfile.$id of asker
  authorName: string;
  title: string;
  body: string;
  topic: string;           // single primary topic/tag for filtering + search
  mediaType: MediaType;
  mediaFileId?: string;    // Appwrite Storage file id (audio/video)
  mediaUrl?: string;       // resolved view URL
  status: 'open' | 'answered';
  answerCount: number;
  $createdAt: string;
}

export interface Answer {
  $id: string;
  questionId: string;
  mentorId: string;        // UserProfile.$id of mentor
  mentorName: string;
  body: string;
  mediaType: MediaType;
  mediaFileId?: string;
  mediaUrl?: string;
  upvotes: number;
  $createdAt: string;
}
