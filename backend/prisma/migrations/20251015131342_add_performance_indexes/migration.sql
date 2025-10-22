/*
  Warnings:

  - You are about to alter the column `credits` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "geminiApiKey" TEXT,
    "credits" BIGINT NOT NULL DEFAULT 500,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "credits", "email", "geminiApiKey", "id", "name", "password", "role", "updatedAt") SELECT "createdAt", "credits", "email", "geminiApiKey", "id", "name", "password", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ChatMessage_userId_idx" ON "ChatMessage"("userId");

-- CreateIndex
CREATE INDEX "ChatMessage_lessonId_idx" ON "ChatMessage"("lessonId");

-- CreateIndex
CREATE INDEX "ChatMessage_userId_createdAt_idx" ON "ChatMessage"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Lesson_userId_idx" ON "Lesson"("userId");

-- CreateIndex
CREATE INDEX "Lesson_userId_createdAt_idx" ON "Lesson"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Module_lessonId_idx" ON "Module"("lessonId");

-- CreateIndex
CREATE INDEX "Module_lessonId_order_idx" ON "Module"("lessonId", "order");

-- CreateIndex
CREATE INDEX "Section_moduleId_idx" ON "Section"("moduleId");

-- CreateIndex
CREATE INDEX "Section_moduleId_order_idx" ON "Section"("moduleId", "order");
