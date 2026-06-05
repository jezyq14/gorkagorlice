ALTER TABLE "classes" ADD COLUMN "vulcan_id" varchar(10);--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_vulcan_id_unique" UNIQUE("vulcan_id");