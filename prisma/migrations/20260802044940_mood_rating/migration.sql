/*
  Warnings:

  - You are about to drop the column `mood` on the `MoodLog` table. All the data in the column will be lost.
  - Added the required column `rating` to the `MoodLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MoodLog" DROP COLUMN "mood",
ADD COLUMN     "rating" INTEGER NOT NULL;
