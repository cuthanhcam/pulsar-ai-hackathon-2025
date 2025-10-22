/*
  Warnings:

  - You are about to drop the column `avgScore` on the `Progress` table. All the data in the column will be lost.
  - You are about to drop the column `lastStudyDate` on the `Progress` table. All the data in the column will be lost.
  - You are about to drop the column `streak` on the `Progress` table. All the data in the column will be lost.
  - You are about to drop the column `totalLessons` on the `Progress` table. All the data in the column will be lost.
  - You are about to drop the column `lessonId` on the `QuizQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `QuizQuestion` table. All the data in the column will be lost.
  - You are about to alter the column `correctAnswer` on the `QuizQuestion` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `options` on the `QuizQuestion` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to drop the column `isCorrect` on the `QuizResult` table. All the data in the column will be lost.
  - You are about to drop the column `questionId` on the `QuizResult` table. All the data in the column will be lost.
  - You are about to drop the column `userAnswer` on the `QuizResult` table. All the data in the column will be lost.
  - Added the required column `quizId` to the `QuizQuestion` table without a default value. This is not possible if the table is not empty.
  - Made the column `options` on table `QuizQuestion` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `answers` to the `QuizResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quizId` to the `QuizResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `QuizResult` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Quiz_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "lessonsCompleted" INTEGER NOT NULL DEFAULT 0,
    "quizzesCompleted" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Progress" ("id", "lessonsCompleted", "updatedAt", "userId") SELECT "id", "lessonsCompleted", "updatedAt", "userId" FROM "Progress";
DROP TABLE "Progress";
ALTER TABLE "new_Progress" RENAME TO "Progress";
CREATE UNIQUE INDEX "Progress_userId_key" ON "Progress"("userId");
CREATE TABLE "new_QuizQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quizId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctAnswer" INTEGER NOT NULL,
    "explanation" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_QuizQuestion" ("correctAnswer", "createdAt", "explanation", "id", "options", "order", "question") SELECT "correctAnswer", "createdAt", "explanation", "id", "options", "order", "question" FROM "QuizQuestion";
DROP TABLE "QuizQuestion";
ALTER TABLE "new_QuizQuestion" RENAME TO "QuizQuestion";
CREATE TABLE "new_QuizResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuizResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuizResult_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_QuizResult" ("completedAt", "id", "userId") SELECT "completedAt", "id", "userId" FROM "QuizResult";
DROP TABLE "QuizResult";
ALTER TABLE "new_QuizResult" RENAME TO "QuizResult";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "geminiApiKey" TEXT,
    "credits" INTEGER NOT NULL DEFAULT 500,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "geminiApiKey", "id", "name", "password", "role", "updatedAt") SELECT "createdAt", "email", "geminiApiKey", "id", "name", "password", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
