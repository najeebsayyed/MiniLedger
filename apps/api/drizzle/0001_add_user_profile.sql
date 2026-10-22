ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_url" text;
