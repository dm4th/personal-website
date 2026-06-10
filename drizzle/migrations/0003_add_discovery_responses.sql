CREATE TABLE "discovery_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"persona" text NOT NULL,
	"visitor_label" text,
	"transcript" jsonb NOT NULL,
	"messages" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
