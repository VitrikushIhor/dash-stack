export const StoredFileKind = {
  IMAGE: 'IMAGE',
  ATTACHMENT: 'ATTACHMENT',
} as const;

export type StoredFileKind = (typeof StoredFileKind)[keyof typeof StoredFileKind];

export interface CreateStoredFileData {
  key: string;
  ownerUserId: string;
  kind: StoredFileKind;
  size: number;
  mimeType: string;
}

export interface ReadableAttachment {
  key: string;
  size: number;
}

export interface StoredFileRepositoryPort {
  create(data: CreateStoredFileData): Promise<void>;
  findKeysByTask(taskId: string, keys: string[]): Promise<string[]>;
  deleteByKeys(keys: string[]): Promise<void>;
  findPendingDeletionKeys(before: Date, limit: number): Promise<string[]>;
  findReadableAttachment(key: string, userId: string): Promise<ReadableAttachment | null>;
  markAbandonedAttachmentsPending(before: Date, limit: number): Promise<number>;
}
