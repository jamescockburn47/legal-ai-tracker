CREATE TABLE `mail_deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`frequency` text NOT NULL,
	`payload` text NOT NULL,
	`until` text NOT NULL,
	`created` text NOT NULL,
	`status` text NOT NULL,
	`provider_id` text
);
--> statement-breakpoint
CREATE TABLE `mail_subscriptions` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`status` text NOT NULL,
	`confirm_hash` text,
	`confirm_expires` text,
	`unsubscribe_token` text NOT NULL,
	`requested` text NOT NULL,
	`confirmed` text,
	`daily_cursor` text NOT NULL,
	`weekly_cursor` text NOT NULL
);
