ALTER TABLE "invites" ADD COLUMN "token" text;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_token_unique" UNIQUE("token");