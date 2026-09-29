CREATE TYPE "StoredFileKind" AS ENUM ('IMAGE', 'ATTACHMENT');

CREATE TABLE "stored_files" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "taskId" TEXT,
    "kind" "StoredFileKind" NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stored_files_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "stored_files_key_key" ON "stored_files"("key");
CREATE INDEX "stored_files_ownerUserId_idx" ON "stored_files"("ownerUserId");
CREATE INDEX "stored_files_taskId_idx" ON "stored_files"("taskId");

ALTER TABLE "stored_files" ADD CONSTRAINT "stored_files_ownerUserId_fkey"
    FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "stored_files" ADD CONSTRAINT "stored_files_taskId_fkey"
    FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
