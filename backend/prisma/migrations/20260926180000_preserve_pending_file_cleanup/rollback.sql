-- Use only after pending cleanup is complete and no orphaned stored_files rows remain.
ALTER TABLE "stored_files" DROP CONSTRAINT "stored_files_taskId_fkey";
ALTER TABLE "stored_files" ADD CONSTRAINT "stored_files_taskId_fkey"
    FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DROP INDEX "stored_files_deletionPendingAt_idx";
ALTER TABLE "stored_files" DROP COLUMN "deletionPendingAt";
