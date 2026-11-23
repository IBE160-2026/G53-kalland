CREATE TABLE "metadata_generations" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"image_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"prompt_version" text NOT NULL,
	"outcome" text NOT NULL,
	"error_category" text,
	"input_tokens" integer,
	"output_tokens" integer,
	"latency_ms" integer NOT NULL,
	"raw_output" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "metadata_generations_outcome_check" CHECK ("metadata_generations"."outcome" in ('success', 'error'))
);
--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "generation_token" uuid;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "lease_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "failure_reason" text;--> statement-breakpoint
ALTER TABLE "metadata_generations" ADD CONSTRAINT "metadata_generations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metadata_generations" ADD CONSTRAINT "metadata_generations_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "metadata_generations_image_id_idx" ON "metadata_generations" USING btree ("image_id");--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_failure_reason_check" CHECK ("images"."failure_reason" in ('auth', 'rate_limit', 'timeout', 'unavailable', 'refused', 'invalid_output', 'interrupted'));