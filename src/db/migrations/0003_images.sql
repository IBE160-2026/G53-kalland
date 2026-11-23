CREATE TABLE "batches" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"owner_id" uuid NOT NULL,
	"visibility" text DEFAULT 'internal' NOT NULL,
	"price_tier" text DEFAULT 'free' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "batches_visibility_check" CHECK ("batches"."visibility" in ('internal', 'restricted', 'public')),
	CONSTRAINT "batches_price_tier_check" CHECK ("batches"."price_tier" in ('free', 'paid'))
);
--> statement-breakpoint
CREATE TABLE "file_versions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"image_id" uuid NOT NULL,
	"hash" text NOT NULL,
	"media_type" text NOT NULL,
	"byte_size" bigint NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "file_versions_media_type_check" CHECK ("file_versions"."media_type" in ('image/jpeg', 'image/png'))
);
--> statement-breakpoint
CREATE TABLE "image_keywords" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"image_id" uuid NOT NULL,
	"keyword" text NOT NULL,
	"source" text NOT NULL,
	"category" text,
	CONSTRAINT "image_keywords_source_check" CHECK ("image_keywords"."source" in ('embedded', 'shared', 'ai', 'staff'))
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"batch_id" uuid NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"filename" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"processing_state" text DEFAULT 'uploading' NOT NULL,
	"visibility" text NOT NULL,
	"price_tier" text NOT NULL,
	"title" text,
	"title_source" text,
	"description" text,
	"description_source" text,
	"alt_text" text,
	"alt_text_source" text,
	"date_taken" timestamp,
	"date_taken_offset" text,
	"camera_make" text,
	"camera_model" text,
	"lens" text,
	"exposure_time" text,
	"f_number" real,
	"focal_length" real,
	"iso" integer,
	"latitude" double precision,
	"longitude" double precision,
	"published_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "images_status_check" CHECK ("images"."status" in ('draft', 'published', 'archived')),
	CONSTRAINT "images_processing_state_check" CHECK ("images"."processing_state" in ('uploading', 'queued', 'generating', 'ready', 'failed')),
	CONSTRAINT "images_visibility_check" CHECK ("images"."visibility" in ('internal', 'restricted', 'public')),
	CONSTRAINT "images_price_tier_check" CHECK ("images"."price_tier" in ('free', 'paid')),
	CONSTRAINT "images_title_source_check" CHECK ("images"."title_source" in ('embedded', 'ai', 'staff')),
	CONSTRAINT "images_description_source_check" CHECK ("images"."description_source" in ('embedded', 'ai', 'staff')),
	CONSTRAINT "images_alt_text_source_check" CHECK ("images"."alt_text_source" in ('embedded', 'ai', 'staff'))
);
--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_versions" ADD CONSTRAINT "file_versions_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_keywords" ADD CONSTRAINT "image_keywords_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "batches_owner_id_idx" ON "batches" USING btree ("owner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "file_versions_hash_unique" ON "file_versions" USING btree ("hash");--> statement-breakpoint
CREATE INDEX "file_versions_image_id_idx" ON "file_versions" USING btree ("image_id");--> statement-breakpoint
CREATE UNIQUE INDEX "image_keywords_image_id_keyword_unique" ON "image_keywords" USING btree ("image_id",lower("keyword"));--> statement-breakpoint
CREATE INDEX "images_batch_id_idx" ON "images" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "images_uploaded_by_idx" ON "images" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "images_processing_state_idx" ON "images" USING btree ("processing_state");