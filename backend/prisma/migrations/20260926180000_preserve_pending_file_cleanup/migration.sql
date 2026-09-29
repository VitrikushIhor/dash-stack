ALTER TABLE "stored_files" ADD COLUMN "deletionPendingAt" TIMESTAMP(3);

CREATE INDEX "stored_files_deletionPendingAt_idx" ON "stored_files"("deletionPendingAt");

ALTER TABLE "stored_files" DROP CONSTRAINT "stored_files_taskId_fkey";
ALTER TABLE "stored_files" ADD CONSTRAINT "stored_files_taskId_fkey"
    FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
