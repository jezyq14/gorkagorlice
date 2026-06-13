CREATE TABLE "timetable_classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vulcan_id" varchar(10) NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "timetable_classes_vulcan_id_unique" UNIQUE("vulcan_id")
);
--> statement-breakpoint
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_name_unique" UNIQUE("name");