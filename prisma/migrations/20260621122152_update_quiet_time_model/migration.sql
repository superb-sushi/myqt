/*
  Warnings:

  - You are about to drop the column `response` on the `QuietTime` table. All the data in the column will be lost.
  - You are about to drop the column `word` on the `QuietTime` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "QuietTime" DROP COLUMN "response",
DROP COLUMN "word",
ADD COLUMN     "details" TEXT,
ADD COLUMN     "reflection" TEXT;
