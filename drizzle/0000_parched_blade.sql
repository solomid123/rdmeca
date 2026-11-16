CREATE TABLE `content_items` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`slug` text NOT NULL,
	`locale` text NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`category` text NOT NULL,
	`body` text NOT NULL,
	`image` text NOT NULL,
	`media_url` text,
	`duration` text,
	`published` integer DEFAULT false NOT NULL,
	`illustrative` integer DEFAULT false NOT NULL,
	`published_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `content_locale_type_slug` ON `content_items` (`locale`,`type`,`slug`);--> statement-breakpoint
CREATE INDEX `content_public_lookup` ON `content_items` (`published`,`locale`,`type`);--> statement-breakpoint
CREATE TABLE `enquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_key` text NOT NULL,
	`reference` text NOT NULL,
	`name` text NOT NULL,
	`company` text,
	`email` text NOT NULL,
	`phone` text,
	`service` text NOT NULL,
	`message` text NOT NULL,
	`locale` text NOT NULL,
	`consent` integer NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`ip_hash` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `enquiries_submission_key_unique` ON `enquiries` (`submission_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `enquiries_reference_unique` ON `enquiries` (`reference`);--> statement-breakpoint
CREATE INDEX `enquiry_rate_limit` ON `enquiries` (`ip_hash`,`created_at`);