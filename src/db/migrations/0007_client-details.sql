ALTER TABLE "clients" ADD COLUMN "org_number" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "billing_email" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "account_manager_id" uuid;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "staff_notes" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "form_nonce" uuid;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_account_manager_id_users_id_fk" FOREIGN KEY ("account_manager_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "clients_form_nonce_unique" ON "clients" USING btree ("form_nonce");--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_org_number_check" CHECK ("clients"."org_number" ~ '^[0-9]{9}$');