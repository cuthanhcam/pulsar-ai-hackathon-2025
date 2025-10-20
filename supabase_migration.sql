-- ============================================
-- K-Tech Database Migration for Supabase
-- Generated from Prisma Schema
-- Run this SQL in Supabase SQL Editor
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- DROP EXISTING TABLES (if re-running)
-- ============================================
DROP TABLE IF EXISTS "CreditTransaction" CASCADE;
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "Message" CASCADE;
DROP TABLE IF EXISTS "ConversationParticipant" CASCADE;
DROP TABLE IF EXISTS "Conversation" CASCADE;
DROP TABLE IF EXISTS "CommentLike" CASCADE;
DROP TABLE IF EXISTS "PostComment" CASCADE;
DROP TABLE IF EXISTS "PostLike" CASCADE;
DROP TABLE IF EXISTS "Post" CASCADE;
DROP TABLE IF EXISTS "Rating" CASCADE;
DROP TABLE IF EXISTS "Enrollment" CASCADE;
DROP TABLE IF EXISTS "ChatMessage" CASCADE;
DROP TABLE IF EXISTS "Progress" CASCADE;
DROP TABLE IF EXISTS "QuizResult" CASCADE;
DROP TABLE IF EXISTS "QuizQuestion" CASCADE;
DROP TABLE IF EXISTS "Quiz" CASCADE;
DROP TABLE IF EXISTS "Mindmap" CASCADE;
DROP TABLE IF EXISTS "Section" CASCADE;
DROP TABLE IF EXISTS "Module" CASCADE;
DROP TABLE IF EXISTS "Lesson" CASCADE;
DROP TABLE IF EXISTS "OTP" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- ============================================
-- CREATE TABLES
-- ============================================

-- User Table
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "geminiApiKey" TEXT,
    "credits" INTEGER NOT NULL DEFAULT 500,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- OTP Table
CREATE TABLE "OTP" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "userId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Lesson Table
CREATE TABLE "Lesson" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'beginner',
    "duration" INTEGER NOT NULL DEFAULT 30,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Module Table
CREATE TABLE "Module" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE
);

-- Section Table
CREATE TABLE "Section" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 10,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE
);

-- Mindmap Table
CREATE TABLE "Mindmap" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "lessonId" TEXT NOT NULL UNIQUE,
    "structure" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE
);

-- Quiz Table
CREATE TABLE "Quiz" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "lessonId" TEXT NOT NULL,
    "sectionId" TEXT,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE
);

-- QuizQuestion Table
CREATE TABLE "QuizQuestion" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "quizId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctAnswer" INTEGER NOT NULL,
    "explanation" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE
);

-- QuizResult Table
CREATE TABLE "QuizResult" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE
);

-- Progress Table
CREATE TABLE "Progress" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL UNIQUE,
    "lessonsCompleted" INTEGER NOT NULL DEFAULT 0,
    "quizzesCompleted" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- ChatMessage Table
CREATE TABLE "ChatMessage" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE
);

-- Enrollment Table
CREATE TABLE "Enrollment" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE,
    UNIQUE ("userId", "lessonId")
);

-- Rating Table
CREATE TABLE "Rating" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE,
    UNIQUE ("userId", "lessonId")
);

-- Post Table
CREATE TABLE "Post" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE
);

-- PostLike Table
CREATE TABLE "PostLike" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reactionType" TEXT NOT NULL DEFAULT 'like',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    UNIQUE ("postId", "userId")
);

-- PostComment Table
CREATE TABLE "PostComment" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    FOREIGN KEY ("parentId") REFERENCES "PostComment"("id") ON DELETE CASCADE
);

-- CommentLike Table
CREATE TABLE "CommentLike" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reactionType" TEXT NOT NULL DEFAULT 'like',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("commentId") REFERENCES "PostComment"("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    UNIQUE ("commentId", "userId")
);

-- Conversation Table
CREATE TABLE "Conversation" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ConversationParticipant Table
CREATE TABLE "ConversationParticipant" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastReadAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    UNIQUE ("conversationId", "userId")
);

-- Message Table
CREATE TABLE "Message" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE,
    FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Notification Table
CREATE TABLE "Notification" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- CreditTransaction Table
CREATE TABLE "CreditTransaction" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "packageName" TEXT,
    "price" DOUBLE PRECISION,
    "balanceBefore" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- ============================================
-- CREATE INDEXES
-- ============================================

-- User indexes
CREATE INDEX "User_email_idx" ON "User"("email");

-- OTP indexes
CREATE INDEX "OTP_email_idx" ON "OTP"("email");
CREATE INDEX "OTP_email_verified_idx" ON "OTP"("email", "verified");
CREATE INDEX "OTP_expiresAt_idx" ON "OTP"("expiresAt");

-- Lesson indexes
CREATE INDEX "Lesson_userId_idx" ON "Lesson"("userId");
CREATE INDEX "Lesson_userId_createdAt_idx" ON "Lesson"("userId", "createdAt");
CREATE INDEX "Lesson_isPublic_createdAt_idx" ON "Lesson"("isPublic", "createdAt");

-- Module indexes
CREATE INDEX "Module_lessonId_idx" ON "Module"("lessonId");
CREATE INDEX "Module_lessonId_order_idx" ON "Module"("lessonId", "order");

-- Section indexes
CREATE INDEX "Section_moduleId_idx" ON "Section"("moduleId");
CREATE INDEX "Section_moduleId_order_idx" ON "Section"("moduleId", "order");

-- Quiz indexes
CREATE INDEX "Quiz_sectionId_idx" ON "Quiz"("sectionId");

-- ChatMessage indexes
CREATE INDEX "ChatMessage_userId_idx" ON "ChatMessage"("userId");
CREATE INDEX "ChatMessage_lessonId_idx" ON "ChatMessage"("lessonId");
CREATE INDEX "ChatMessage_userId_createdAt_idx" ON "ChatMessage"("userId", "createdAt");

-- Enrollment indexes
CREATE INDEX "Enrollment_userId_idx" ON "Enrollment"("userId");
CREATE INDEX "Enrollment_lessonId_idx" ON "Enrollment"("lessonId");

-- Rating indexes
CREATE INDEX "Rating_lessonId_idx" ON "Rating"("lessonId");
CREATE INDEX "Rating_lessonId_rating_idx" ON "Rating"("lessonId", "rating");

-- Post indexes
CREATE INDEX "Post_userId_idx" ON "Post"("userId");
CREATE INDEX "Post_lessonId_idx" ON "Post"("lessonId");
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");

-- PostLike indexes
CREATE INDEX "PostLike_postId_idx" ON "PostLike"("postId");
CREATE INDEX "PostLike_userId_idx" ON "PostLike"("userId");
CREATE INDEX "PostLike_reactionType_idx" ON "PostLike"("reactionType");

-- PostComment indexes
CREATE INDEX "PostComment_postId_idx" ON "PostComment"("postId");
CREATE INDEX "PostComment_userId_idx" ON "PostComment"("userId");
CREATE INDEX "PostComment_parentId_idx" ON "PostComment"("parentId");
CREATE INDEX "PostComment_createdAt_idx" ON "PostComment"("createdAt");

-- CommentLike indexes
CREATE INDEX "CommentLike_commentId_idx" ON "CommentLike"("commentId");
CREATE INDEX "CommentLike_userId_idx" ON "CommentLike"("userId");

-- Conversation indexes
CREATE INDEX "Conversation_updatedAt_idx" ON "Conversation"("updatedAt");

-- ConversationParticipant indexes
CREATE INDEX "ConversationParticipant_userId_idx" ON "ConversationParticipant"("userId");
CREATE INDEX "ConversationParticipant_conversationId_idx" ON "ConversationParticipant"("conversationId");

-- Message indexes
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- Notification indexes
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreditTransaction indexes
CREATE INDEX "CreditTransaction_userId_idx" ON "CreditTransaction"("userId");
CREATE INDEX "CreditTransaction_type_idx" ON "CreditTransaction"("type");
CREATE INDEX "CreditTransaction_createdAt_idx" ON "CreditTransaction"("createdAt");
CREATE INDEX "CreditTransaction_userId_createdAt_idx" ON "CreditTransaction"("userId", "createdAt");

-- ============================================
-- CREATE TRIGGERS FOR updatedAt
-- ============================================

-- Function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updatedAt
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lesson_updated_at BEFORE UPDATE ON "Lesson" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mindmap_updated_at BEFORE UPDATE ON "Mindmap" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quiz_updated_at BEFORE UPDATE ON "Quiz" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON "Progress" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rating_updated_at BEFORE UPDATE ON "Rating" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_post_updated_at BEFORE UPDATE ON "Post" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_postcomment_updated_at BEFORE UPDATE ON "PostComment" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversation_updated_at BEFORE UPDATE ON "Conversation" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONE! 🎉
-- ============================================

SELECT 'Database migration completed successfully! 🚀' AS status;

