CREATE TABLE `alerts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`filters` text NOT NULL,
	`frequency` text NOT NULL,
	`enabled` integer DEFAULT 1 NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `records` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`title` text NOT NULL,
	`publisher` text NOT NULL,
	`date` text,
	`kind` text NOT NULL,
	`jurisdiction` text NOT NULL,
	`topics` text NOT NULL,
	`roles` text NOT NULL,
	`summary` text NOT NULL,
	`action` text DEFAULT '' NOT NULL,
	`authority` text NOT NULL,
	`verification` text NOT NULL,
	`pinpoint` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'Current' NOT NULL,
	`evidence` text DEFAULT '' NOT NULL,
	`editorial` text DEFAULT 'Machine-assisted; editorial review pending' NOT NULL,
	`discovered` text NOT NULL,
	`updated` text NOT NULL,
	`published` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `records_url_unique` ON `records` (`url`);--> statement-breakpoint
CREATE TABLE `revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`record_id` text NOT NULL,
	`at` text NOT NULL,
	`payload` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `runs` (
	`id` text PRIMARY KEY NOT NULL,
	`at` text NOT NULL,
	`note` text NOT NULL,
	`count` integer NOT NULL,
	`sources` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `saved` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`record_id` text NOT NULL,
	`category` text DEFAULT 'Reading list' NOT NULL,
	`decision` text DEFAULT 'To review' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `saved_user_record` ON `saved` (`user_id`,`record_id`);