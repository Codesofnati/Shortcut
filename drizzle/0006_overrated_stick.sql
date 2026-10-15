ALTER TABLE "products" ADD COLUMN "average_time" text DEFAULT '15 minutes';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "min_order" integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "max_order" integer DEFAULT 1000000 NOT NULL;