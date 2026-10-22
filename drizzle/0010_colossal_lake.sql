CREATE INDEX `analytics_visit_day` ON `analytics_events` (`visit`,`day`);--> statement-breakpoint
CREATE INDEX `analytics_day` ON `analytics_events` (`day`);