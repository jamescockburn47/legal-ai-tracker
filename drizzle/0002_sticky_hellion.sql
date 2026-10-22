CREATE TABLE `suggestions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`email` text NOT NULL,
	`url` text NOT NULL,
	`title` text NOT NULL,
	`reason` text NOT NULL,
	`created` text NOT NULL,
	`state` text DEFAULT 'Awaiting review' NOT NULL,
	`response` text DEFAULT '' NOT NULL,
	`record_id` text
);
