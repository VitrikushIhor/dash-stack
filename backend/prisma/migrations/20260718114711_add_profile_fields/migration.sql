-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "dob" TIMESTAMP(3),
ADD COLUMN     "urls" TEXT[] DEFAULT ARRAY[]::TEXT[];
