export interface TaskFileStoragePort {
  prepareDeletion(taskId: string, keys: string[]): Promise<string[]>;
  deleteMany(keys: string[]): Promise<void>;
}
