CREATE TABLE `analytics_events` (
	`id` text PRIMARY KEY NOT NULL,
	`visit` text NOT NULL,
	`day` text NOT NULL,
	`event` text NOT NULL,
	`target` text NOT NULL,
	`referrer` text NOT NULL
);
