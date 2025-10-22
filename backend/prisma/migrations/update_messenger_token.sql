-- Migration: Update MessengerToken table to add userId column
-- This migration adds the missing userId column and foreign key constraint

-- Check if table exists
DO $$
BEGIN
  -- Add userId column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'MessengerToken' 
    AND column_name = 'userId'
  ) THEN
    ALTER TABLE "MessengerToken" ADD COLUMN "userId" TEXT;
    
    -- Add foreign key constraint
    ALTER TABLE "MessengerToken" 
    ADD CONSTRAINT "MessengerToken_userId_fkey" 
    FOREIGN KEY ("userId") 
    REFERENCES "User"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE;
    
    -- Add index for userId
    CREATE INDEX "MessengerToken_userId_idx" ON "MessengerToken"("userId");
    
    RAISE NOTICE 'Added userId column to MessengerToken table';
  ELSE
    RAISE NOTICE 'userId column already exists';
  END IF;
END
$$;

