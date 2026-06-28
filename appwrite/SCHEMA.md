# Mentora — Appwrite data model

Database id: `mentora`

## Collection: `users`
Mentee + mentor profiles (one per Appwrite Account).

| Attribute   | Type     | Size | Required | Default | Notes |
|-------------|----------|------|----------|---------|-------|
| accountId   | string   | 64   | yes      | —       | Appwrite Account `$id` |
| name        | string   | 128  | yes      | —       | |
| email       | string   | 256  | yes      | —       | |
| avatarUrl   | string   | 512  | no       | —       | initials avatar URL |
| isMentor    | boolean  | —    | no       | false   | |
| isAvailable | boolean  | —    | no       | false   | mentor availability toggle |
| expertise   | string[] | 32   | no       | []      | array; topic tags |
| bio         | string   | 1000 | no       | ""      | |

Indexes: `accountId` (key), `isMentor` (key), `isAvailable` (key).
Permissions (collection level): Read `any`; Create/Update/Delete `users`.

## Collection: `questions`
| Attribute   | Type    | Size | Required | Default | Notes |
|-------------|---------|------|----------|---------|-------|
| authorId    | string  | 64   | yes      | —       | users.$id |
| authorName  | string  | 128  | yes      | —       | denormalized for fast lists |
| title       | string  | 200  | yes      | —       | |
| body        | string  | 5000 | no       | ""      | |
| topic       | string  | 32   | yes      | —       | one of the topic tags |
| mediaType   | enum     | —    | yes      | text    | `text` \| `audio` \| `video` |
| mediaFileId | string  | 64   | no       | —       | Storage file id |
| status      | enum     | —    | yes      | open    | `open` \| `answered` |
| answerCount | integer | —    | no       | 0       | |

Indexes: `topic` (key), `status` (key), `$createdAt` (key, DESC),
**`title` (fulltext)** and **`body` (fulltext)** — required for search.
Permissions: Read `any`; Create `users`; Update `users` (so a mentor can flag
it answered); Delete restricted to the author via document-level permission.

## Collection: `answers`
| Attribute   | Type    | Size | Required | Default | Notes |
|-------------|---------|------|----------|---------|-------|
| questionId  | string  | 64   | yes      | —       | questions.$id |
| mentorId    | string  | 64   | yes      | —       | users.$id |
| mentorName  | string  | 128  | yes      | —       | denormalized |
| body        | string  | 5000 | no       | ""      | |
| mediaType   | enum     | —    | yes      | text    | `text` \| `audio` \| `video` |
| mediaFileId | string  | 64   | no       | —       | Storage file id |
| upvotes     | integer | —    | no       | 0       | peer-review signal |

Indexes: `questionId` (key), `upvotes` (key, DESC).
Permissions: Read `any`; Create `users`; Update `users`; Delete author-only.

## Collection: `notifications` (optional — used by the notify-mentors function)
| Attribute   | Type    | Size | Required | Default |
|-------------|---------|------|----------|---------|
| recipientId | string  | 64   | yes      | —       |
| questionId  | string  | 64   | yes      | —       |
| title       | string  | 200  | yes      | —       |
| body        | string  | 200  | no       | ""      |
| read        | boolean | —    | no       | false   |

Index: `recipientId` (key).

## Storage bucket: `media`
Audio/video uploads. Allowed extensions: `m4a, mp3, wav, mp4, mov`. Max size
e.g. 50 MB. File-level read permission is set to `any` on upload (public Q&A);
Create is restricted to `users`.
