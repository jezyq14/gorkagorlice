CREATE TYPE "public"."schedule_variant" AS ENUM('STANDARD', 'SHORT_30_LONG_BREAK', 'SHORT_30_NO_BREAK', 'SHORT_35_LONG_BREAK', 'SHORT_35_NO_BREAK', 'OTHER');--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vulcan_id" varchar(10),
	"name" varchar(50) NOT NULL,
	CONSTRAINT "rooms_vulcan_id_unique" UNIQUE("vulcan_id")
);
--> statement-breakpoint
CREATE TABLE "schedule_overrides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"variant" "schedule_variant" NOT NULL,
	"reason" varchar(255),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "schedule_overrides_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "teachers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vulcan_id" varchar(10),
	"name" varchar(255) NOT NULL,
	CONSTRAINT "teachers_vulcan_id_unique" UNIQUE("vulcan_id")
);
--> statement-breakpoint
CREATE TABLE "timetable_hours" (
	"number" integer PRIMARY KEY NOT NULL,
	"time_from" varchar(5) NOT NULL,
	"time_to" varchar(5) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timetable_lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"hour_number" integer NOT NULL,
	"subject" varchar(100) NOT NULL,
	"group_name" varchar(50),
	"teacher_id" uuid,
	"room_id" uuid,
	"teacher_name_fallback" varchar(100),
	"room_name_fallback" varchar(50)
);
--> statement-breakpoint
ALTER TABLE "timetable_lessons" ADD CONSTRAINT "timetable_lessons_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_lessons" ADD CONSTRAINT "timetable_lessons_hour_number_timetable_hours_number_fk" FOREIGN KEY ("hour_number") REFERENCES "public"."timetable_hours"("number") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_lessons" ADD CONSTRAINT "timetable_lessons_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_lessons" ADD CONSTRAINT "timetable_lessons_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE set null ON UPDATE no action;