// Upload media (audio/video/image) to Appwrite Storage and resolve view URLs.
import { ID, Permission, Role } from 'react-native-appwrite';
import { storage, appwriteConfig } from '@/lib/appwrite';

export interface LocalFile {
  uri: string;
  name: string;
  type: string; // mime type
  size: number;
}

// react-native-appwrite accepts a file descriptor object for uploads.
export async function uploadMedia(file: LocalFile): Promise<string> {
  const created = await storage.createFile(
    appwriteConfig.mediaBucketId,
    ID.unique(),
    {
      name: file.name,
      type: file.type,
      size: file.size,
      uri: file.uri,
    },
    [Permission.read(Role.any())], // Q&A media is public-readable
  );
  return created.$id;
}

// Build a URL the app can stream / display from a stored file id.
export function getMediaUrl(fileId?: string): string | undefined {
  if (!fileId) return undefined;
  const { endpoint, mediaBucketId, projectId } = appwriteConfig;
  return `${endpoint}/storage/buckets/${mediaBucketId}/files/${fileId}/view?project=${projectId}`;
}
