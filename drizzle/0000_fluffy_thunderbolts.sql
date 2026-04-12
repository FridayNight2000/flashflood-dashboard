CREATE TABLE "station_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"station_id" text NOT NULL,
	"start_time" timestamp,
	"peak_time" timestamp,
	"end_time" timestamp,
	"start_value" real,
	"peak_value" real,
	"end_value" real,
	"rise_time" real,
	"fall_time" real
);
--> statement-breakpoint
CREATE TABLE "stations" (
	"station_id" text PRIMARY KEY NOT NULL,
	"latitude" real,
	"longitude" real,
	"basin_name" text,
	"river_name" text,
	"station_name" text,
	"station_name2" text,
	"station_name3" text,
	"description" text,
	"has_data" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "station_records" ADD CONSTRAINT "station_records_station_id_stations_station_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."stations"("station_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "idx_records_peak_value" ON "station_records" USING btree ("peak_value");
--> statement-breakpoint
CREATE INDEX "idx_records_station_time" ON "station_records" USING btree ("station_id","peak_time");
--> statement-breakpoint
CREATE INDEX "idx_records_peak_time" ON "station_records" USING btree ("peak_time");
--> statement-breakpoint
CREATE INDEX "idx_stations_basin" ON "stations" USING btree ("basin_name");
