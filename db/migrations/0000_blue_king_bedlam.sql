CREATE TABLE IF NOT EXISTS "daily_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"bmr_kcal" integer NOT NULL,
	"tdee_kcal" integer NOT NULL,
	"target_intake_kcal" integer NOT NULL,
	"goal_type" text NOT NULL,
	"goal_adjustment_kcal" integer NOT NULL,
	"weight_kg_snapshot" numeric(5, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "food_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"meal_type" text NOT NULL,
	"food_name" text NOT NULL,
	"amount_value" numeric(8, 2) NOT NULL,
	"amount_unit" text NOT NULL,
	"calories_kcal" integer NOT NULL,
	"source_type" text NOT NULL,
	"source_note" text,
	"ai_confidence" numeric(3, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "food_library" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"canonical_name" text NOT NULL,
	"default_amount_value" numeric(8, 2) NOT NULL,
	"default_amount_unit" text NOT NULL,
	"calories_per_unit_kcal" numeric(8, 2) NOT NULL,
	"reference_unit" text NOT NULL,
	"source_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"gender" text NOT NULL,
	"age" integer NOT NULL,
	"height_cm" numeric(5, 2) NOT NULL,
	"weight_kg" numeric(5, 2) NOT NULL,
	"activity_level" text NOT NULL,
	"goal_type" text NOT NULL,
	"goal_adjustment_kcal" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "weight_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"weight_kg" numeric(5, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
