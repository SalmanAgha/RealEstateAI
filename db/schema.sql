-- PostgreSQL Database Schema for SaaS Platform 2026
-- Derived from Prisma Schema

-- Create User Table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "subscription" TEXT NOT NULL DEFAULT 'free',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create Subscription Table
CREATE TABLE IF NOT EXISTS "Subscription" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "renewalDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Example Admin Query
-- INSERT INTO "User" (id, email, password, name, role, status, "updatedAt") 
-- VALUES ('admin-uuid', 'admin@example.com', 'hashed_password', 'Admin', 'admin', 'active', CURRENT_TIMESTAMP);

-- Get All Users Query
-- SELECT * FROM "User";

-- Upgrade User Query
-- UPDATE "User" SET "subscription" = 'pro' WHERE "email" = 'user@example.com';
