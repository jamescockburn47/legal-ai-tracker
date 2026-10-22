CREATE TABLE `editorial_proposals` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`target` text NOT NULL,
	`title` text NOT NULL,
	`before` text NOT NULL,
	`payload` text NOT NULL,
	`reason` text NOT NULL,
	`verification` text NOT NULL,
	`created` text NOT NULL,
	`state` text DEFAULT 'Pending' NOT NULL,
	`reviewed` text,
	`notification` text DEFAULT 'Pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `topic_articles` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `topic_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`article_id` text NOT NULL,
	`payload` text NOT NULL,
	`reason` text NOT NULL,
	`at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `records` ADD `background` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `records` ADD `commentary` text DEFAULT '' NOT NULL;