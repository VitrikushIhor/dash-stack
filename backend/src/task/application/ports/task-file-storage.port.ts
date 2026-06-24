export interface TaskFileStoragePort {
  deleteMany(keys: string[]): Promise<void>;
}
