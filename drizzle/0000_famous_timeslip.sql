-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `stations` (
	`station_id` text PRIMARY KEY,
	`latitude` real,
	`longitude` real,
	`basin_name` text,
	`river_name` text,
	`station_name` text,
	`station_name2` text,
	`station_name3` text,
	`description` text,
	`has_data` integer DEFAULT 0
);
--> statement-breakpoint
CREATE INDEX `idx_stations_has_data` ON `stations` (`has_data`);--> statement-breakpoint
CREATE INDEX `idx_stations_basin` ON `stations` (`basin_name`);--> statement-breakpoint
CREATE INDEX `idx_stations_river` ON `stations` (`river_name`);--> statement-breakpoint
CREATE TABLE `station_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`station_id` text,
	`start_time` text,
	`peak_time` text,
	`end_time` text,
	`start_value` real,
	`peak_value` real,
	`end_value` real,
	`rise_time` real,
	`fall_time` real,
	`peak_time_str` text,
	FOREIGN KEY (`station_id`) REFERENCES `stations`(`station_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_records_peak_value` ON `station_records` (`peak_value`);--> statement-breakpoint
CREATE INDEX `idx_records_station_time` ON `station_records` (`station_id`,`peak_time`);--> statement-breakpoint
CREATE INDEX `idx_records_peak_time` ON `station_records` (`peak_time`);
*/