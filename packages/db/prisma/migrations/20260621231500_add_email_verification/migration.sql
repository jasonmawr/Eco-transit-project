-- Migration: Add Email Verification and Token Fields Safely
-- Target: PostgreSQL / Local development database

-- Step 1: Add the new fields as nullable.
-- This ensures that existing rows can accept NULL temporarily during schema upgrade.
ALTER TABLE "User" ADD COLUMN "emailVerified" BOOLEAN;
ALTER TABLE "User" ADD COLUMN "verificationTokenHash" TEXT;
ALTER TABLE "User" ADD COLUMN "verificationTokenExpires" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "verificationSentAt" TIMESTAMP(3);

-- Step 2: Backfill all existing users to have verified status (true).
-- This preserves existing user records, demo users, moderators, and admin accounts
-- so that they do not get locked out of logging in.
UPDATE "User" SET "emailVerified" = true WHERE "emailVerified" IS NULL;

-- Step 3: Set DEFAULT false for new accounts created after this migration.
ALTER TABLE "User" ALTER COLUMN "emailVerified" SET DEFAULT false;

-- Step 4: Apply the NOT NULL constraint to enforce data integrity.
ALTER TABLE "User" ALTER COLUMN "emailVerified" SET NOT NULL;
