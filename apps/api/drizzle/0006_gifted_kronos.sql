ALTER TABLE "timetable_lessons" DROP CONSTRAINT "timetable_lessons_class_id_classes_id_fk";
--> statement-breakpoint
ALTER TABLE "timetable_lessons" ADD CONSTRAINT "timetable_lessons_class_id_timetable_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."timetable_classes"("id") ON DELETE cascade ON UPDATE no action;