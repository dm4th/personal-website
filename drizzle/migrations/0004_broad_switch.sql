DELETE FROM "discovery_responses";--> statement-breakpoint
ALTER TABLE "discovery_responses" ADD COLUMN "conversation_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "discovery_responses" ADD COLUMN "completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "discovery_responses" ADD COLUMN "meddpicc" jsonb;--> statement-breakpoint
ALTER TABLE "discovery_responses" ADD CONSTRAINT "discovery_responses_conversation_id_unique" UNIQUE("conversation_id");