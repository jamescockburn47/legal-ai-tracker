CREATE TABLE `currency_proposals` (
	`id` text PRIMARY KEY NOT NULL,
	`record_id` text NOT NULL,
	`proposed_status` text NOT NULL,
	`note` text NOT NULL,
	`source_url` text NOT NULL,
	`related` text DEFAULT '[]' NOT NULL,
	`created` text NOT NULL,
	`review_state` text DEFAULT 'Pending' NOT NULL
);
--> statement-breakpoint
ALTER TABLE `records` ADD `currency_status` text DEFAULT 'Not assessed' NOT NULL;--> statement-breakpoint
ALTER TABLE `records` ADD `currency_note` text DEFAULT 'Subsequent history and current applicability have not been assessed.' NOT NULL;--> statement-breakpoint
ALTER TABLE `records` ADD `currency_source` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `records` ADD `checked_at` text;--> statement-breakpoint
ALTER TABLE `records` ADD `related` text DEFAULT '[]' NOT NULL;