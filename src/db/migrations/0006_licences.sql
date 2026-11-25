CREATE TABLE "licences" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"contact_id" uuid,
	"image_id" uuid NOT NULL,
	"image_title" text,
	"licence_type_id" uuid NOT NULL,
	"licence_text_id" uuid NOT NULL,
	"source" text NOT NULL,
	"price_minor" integer NOT NULL,
	"currency" char(3) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "licences_source_check" CHECK ("licences"."source" in ('purchase', 'free_download', 'staff_grant')),
	CONSTRAINT "licences_price_minor_check" CHECK ("licences"."price_minor" >= 0)
);
--> statement-breakpoint
ALTER TABLE "licences" ADD CONSTRAINT "licences_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "licences" ADD CONSTRAINT "licences_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "licences" ADD CONSTRAINT "licences_contact_id_users_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "licences" ADD CONSTRAINT "licences_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "licences" ADD CONSTRAINT "licences_licence_type_id_licence_types_id_fk" FOREIGN KEY ("licence_type_id") REFERENCES "public"."licence_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "licences" ADD CONSTRAINT "licences_licence_text_id_licence_texts_id_fk" FOREIGN KEY ("licence_text_id") REFERENCES "public"."licence_texts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "licences_client_id_image_id_active_unique" ON "licences" USING btree ("client_id","image_id") WHERE "licences"."revoked_at" is null;--> statement-breakpoint
CREATE INDEX "licences_image_id_idx" ON "licences" USING btree ("image_id");--> statement-breakpoint
CREATE INDEX "licences_created_at_idx" ON "licences" USING btree ("created_at" DESC NULLS LAST,"id" DESC NULLS LAST);