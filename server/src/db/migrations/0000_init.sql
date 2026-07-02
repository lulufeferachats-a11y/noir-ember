CREATE TYPE "public"."reservation_status" AS ENUM('pending', 'confirmed', 'cancelled');
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "restaurants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(150) NOT NULL,
	"address" text NOT NULL,
	"phone" varchar(30) NOT NULL,
	"email" varchar(150) NOT NULL,
	"logo_url" text,
	"primary_color" varchar(20) DEFAULT '#C9A96E',
	"secondary_color" varchar(20) DEFAULT '#0A0A0A',
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "restaurants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reservations" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"customer_name" varchar(150) NOT NULL,
	"guests" integer NOT NULL,
	"reservation_date" date NOT NULL,
	"reservation_time" time NOT NULL,
	"phone" varchar(30) NOT NULL,
	"email" varchar(150),
	"notes" text,
	"status" "reservation_status" DEFAULT 'pending' NOT NULL,
	"source" varchar(30) DEFAULT 'chatbot' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reservations_restaurant_id_idx" ON "reservations" ("restaurant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reservations_status_idx" ON "reservations" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reservations_date_idx" ON "reservations" ("reservation_date");
