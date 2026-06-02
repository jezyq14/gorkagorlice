CREATE TABLE "lucky_numbers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"numbers" integer[] NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "lucky_numbers_date_unique" UNIQUE("date")
);
