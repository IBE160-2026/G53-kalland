CREATE TABLE "image_clients" (
	"image_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "image_clients_image_id_client_id_pk" PRIMARY KEY("image_id","client_id")
);
--> statement-breakpoint
CREATE TABLE "licence_texts" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"licence_type_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "licence_types" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"price_minor" integer NOT NULL,
	"currency" char(3) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "licence_types_price_minor_check" CHECK ("licence_types"."price_minor" >= 0)
);
--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "visible_to_all_since" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "image_clients" ADD CONSTRAINT "image_clients_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_clients" ADD CONSTRAINT "image_clients_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "licence_texts" ADD CONSTRAINT "licence_texts_licence_type_id_licence_types_id_fk" FOREIGN KEY ("licence_type_id") REFERENCES "public"."licence_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "licence_types" ADD CONSTRAINT "licence_types_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "image_clients_client_id_idx" ON "image_clients" USING btree ("client_id");--> statement-breakpoint
CREATE UNIQUE INDEX "licence_texts_licence_type_id_version_unique" ON "licence_texts" USING btree ("licence_type_id","version");--> statement-breakpoint
CREATE INDEX "images_created_at_idx" ON "images" USING btree ("created_at" DESC NULLS LAST,"id" DESC NULLS LAST);