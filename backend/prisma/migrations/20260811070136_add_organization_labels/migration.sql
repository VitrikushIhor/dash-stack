/*
  Warnings:

  - You are about to drop the `task_labels` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "task_labels" DROP CONSTRAINT "task_labels_taskId_fkey";

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "labelId" TEXT;

-- DropTable
DROP TABLE "task_labels";

-- CreateTable
CREATE TABLE "organization_labels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "organization_labels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "organization_labels_organizationId_idx" ON "organization_labels"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_labels_organizationId_name_key" ON "organization_labels"("organizationId", "name");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "organization_labels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_labels" ADD CONSTRAINT "organization_labels_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
