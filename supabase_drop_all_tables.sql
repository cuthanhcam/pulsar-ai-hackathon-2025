-- ============================================
-- DROP ALL TABLES - K-Tech Database
-- CẢNH BÁO: Lệnh này sẽ XÓA TOÀN BỘ DỮ LIỆU!
-- Chỉ chạy khi bạn muốn reset database hoàn toàn
-- ============================================

-- Drop all tables in correct order (reverse of foreign key dependencies)
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

-- Drop the trigger function if exists
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Verify all tables are dropped
SELECT 'All tables dropped successfully! Ready for migration.' AS status;

