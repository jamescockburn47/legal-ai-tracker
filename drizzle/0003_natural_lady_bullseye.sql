CREATE TABLE `overview_panels` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `records` ADD `audiences` text DEFAULT '[]' NOT NULL;