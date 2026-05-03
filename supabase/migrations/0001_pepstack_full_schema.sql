-- =====================================================================
-- Pepstack Davao — Full Supabase schema (replaces Convex backend)
-- Run this in the Supabase SQL editor on a clean database.
-- Column names use camelCase (quoted) to match the existing TypeScript
-- code shape, minimizing changes in React components.
-- =====================================================================

-- Extensions ----------------------------------------------------------
create extension if not exists "pgcrypto";  -- for gen_random_uuid()

-- Helper: updated_at trigger -----------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new."updatedAt" := (extract(epoch from now()) * 1000)::bigint;
  return new;
end;
$$;

-- =====================================================================
-- 1. categories
-- =====================================================================
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  icon        text not null,
  "sortOrder" integer not null default 0,
  active      boolean not null default true,
  "_creationTime" bigint not null default (extract(epoch from now()) * 1000)::bigint
);
create index if not exists categories_name_idx       on public.categories (name);
create index if not exists categories_sort_order_idx on public.categories ("sortOrder");

-- =====================================================================
-- 2. products
-- =====================================================================
create table if not exists public.products (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  description         text not null default '',
  "basePrice"         numeric not null default 0,
  "categoryId"        uuid references public.categories(id) on delete set null,
  available           boolean not null default true,
  featured            boolean not null default false,
  "stockQuantity"     integer not null default 0,
  "imageUrl"          text,
  "discountPrice"     numeric,
  "discountStartDate" bigint,
  "discountEndDate"   bigint,
  "discountActive"    boolean,
  "purityPercentage"  numeric,
  "molecularWeight"   text,
  "casNumber"         text,
  sequence            text,
  "storageConditions" text,
  inclusions          jsonb,
  "safetySheetUrl"    text,
  "_creationTime"     bigint not null default (extract(epoch from now()) * 1000)::bigint
);
create index if not exists products_name_idx     on public.products (name);
create index if not exists products_category_idx on public.products ("categoryId");
create index if not exists products_featured_idx on public.products (featured);

-- =====================================================================
-- 3. productVariations
-- =====================================================================
create table if not exists public."productVariations" (
  id              uuid primary key default gen_random_uuid(),
  "productId"     uuid not null references public.products(id) on delete cascade,
  name            text not null,
  "quantityMg"    numeric not null default 0,
  price           numeric not null default 0,
  "stockQuantity" integer not null default 0,
  "discountPrice" numeric,
  "discountActive" boolean,
  "_creationTime" bigint not null default (extract(epoch from now()) * 1000)::bigint
);
create index if not exists product_variations_product_idx on public."productVariations" ("productId");

-- =====================================================================
-- 4. siteSettings   (key/value)
-- =====================================================================
create table if not exists public."siteSettings" (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  value       text not null default '',
  type        text not null default 'text',
  description text,
  "_creationTime" bigint not null default (extract(epoch from now()) * 1000)::bigint
);
create index if not exists site_settings_key_idx on public."siteSettings" (key);

-- =====================================================================
-- 5. paymentMethods
-- =====================================================================
create table if not exists public."paymentMethods" (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  "accountNumber" text,
  "accountName"   text,
  "qrCodeUrl"     text,
  active          boolean not null default true,
  "sortOrder"     integer not null default 0,
  "_creationTime" bigint not null default (extract(epoch from now()) * 1000)::bigint
);
create index if not exists payment_methods_name_idx       on public."paymentMethods" (name);
create index if not exists payment_methods_sort_order_idx on public."paymentMethods" ("sortOrder");

-- =====================================================================
-- 6. shippingLocations
-- =====================================================================
create table if not exists public."shippingLocations" (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique,
  name         text not null,
  fee          numeric not null default 0,
  "isActive"   boolean not null default true,
  "orderIndex" integer not null default 0,
  "_creationTime" bigint not null default (extract(epoch from now()) * 1000)::bigint
);
create index if not exists shipping_locations_code_idx        on public."shippingLocations" (code);
create index if not exists shipping_locations_order_index_idx on public."shippingLocations" ("orderIndex");

-- =====================================================================
-- 7. couriers
-- =====================================================================
create table if not exists public.couriers (
  id                     uuid primary key default gen_random_uuid(),
  code                   text not null unique,
  name                   text not null,
  "trackingUrlTemplate"  text,
  "isActive"             boolean not null default true,
  "sortOrder"            integer,
  "_creationTime"        bigint not null default (extract(epoch from now()) * 1000)::bigint
);
create index if not exists couriers_code_idx       on public.couriers (code);
create index if not exists couriers_sort_order_idx on public.couriers ("sortOrder");

-- =====================================================================
-- 8. promoCodes
-- =====================================================================
create table if not exists public."promoCodes" (
  id                   uuid primary key default gen_random_uuid(),
  code                 text not null unique,
  "discountType"       text not null check ("discountType" in ('percentage','fixed')),
  "discountValue"      numeric not null default 0,
  "minPurchaseAmount"  numeric,
  "maxDiscountAmount"  numeric,
  "startDate"          bigint,
  "endDate"            bigint,
  "usageLimit"         integer,
  "usageCount"         integer not null default 0,
  active               boolean not null default true,
  "_creationTime"      bigint not null default (extract(epoch from now()) * 1000)::bigint
);
create index if not exists promo_codes_code_idx on public."promoCodes" (code);

-- =====================================================================
-- 9. orders
-- =====================================================================
create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  "orderNumber"       text unique,
  "customerName"      text not null,
  "customerEmail"     text not null,
  "customerPhone"     text not null,
  "contactMethod"     text,
  "shippingAddress"   text not null,
  "shippingCity"      text,
  "shippingState"     text,
  "shippingZipCode"   text,
  "shippingCountry"   text,
  "shippingBarangay"  text,
  "shippingRegion"    text,
  "shippingLocation"  text,
  "courierId"         uuid references public.couriers(id) on delete set null,
  "shippingFee"       numeric,
  "orderItems"        jsonb not null,
  subtotal            numeric,
  "totalPrice"        numeric not null default 0,
  "pricingMode"       text,
  "paymentMethodId"   text,
  "paymentMethodName" text,
  "paymentStatus"     text,
  "paymentProofUrl"   text,
  "promoCodeId"       uuid references public."promoCodes"(id) on delete set null,
  "promoCode"         text,
  "discountApplied"   numeric,
  "orderStatus"       text default 'pending',
  notes               text,
  "adminNotes"        text,
  "trackingNumber"    text,
  "trackingCourier"   text,
  "shippingProvider"  text,
  "shippingNote"      text,
  "shippedAt"         bigint,
  "updatedAt"         bigint,
  "_creationTime"     bigint not null default (extract(epoch from now()) * 1000)::bigint
);
create index if not exists orders_email_idx        on public.orders ("customerEmail");
create index if not exists orders_phone_idx        on public.orders ("customerPhone");
create index if not exists orders_status_idx       on public.orders ("orderStatus");
create index if not exists orders_order_number_idx on public.orders ("orderNumber");

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- =====================================================================
-- 10. coaReports
-- =====================================================================
create table if not exists public."coaReports" (
  id                   uuid primary key default gen_random_uuid(),
  "productName"        text not null,
  batch                text,
  "testDate"           text not null,
  "purityPercentage"   numeric not null default 0,
  quantity             text not null,
  "taskNumber"         text not null,
  "verificationKey"    text not null unique,
  "imageUrl"           text not null,
  featured             boolean not null default false,
  manufacturer         text,
  laboratory           text,
  "_creationTime"      bigint not null default (extract(epoch from now()) * 1000)::bigint
);
create index if not exists coa_verification_idx on public."coaReports" ("verificationKey");
create index if not exists coa_featured_idx     on public."coaReports" (featured);

-- =====================================================================
-- 11. faqs
-- =====================================================================
create table if not exists public.faqs (
  id           uuid primary key default gen_random_uuid(),
  question     text not null,
  answer       text not null,
  category     text not null default 'general',
  "orderIndex" integer not null default 0,
  "isActive"   boolean not null default true,
  "_creationTime" bigint not null default (extract(epoch from now()) * 1000)::bigint
);
create index if not exists faqs_category_idx    on public.faqs (category);
create index if not exists faqs_order_index_idx on public.faqs ("orderIndex");

-- =====================================================================
-- 12. articles
-- =====================================================================
create table if not exists public.articles (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  preview         text,
  content         text not null,
  "coverImage"    text,
  author          text not null default '',
  "publishedDate" text not null,
  "displayOrder"  integer not null default 0,
  "isEnabled"     boolean not null default true,
  "_creationTime" bigint not null default (extract(epoch from now()) * 1000)::bigint
);
create index if not exists articles_display_order_idx on public.articles ("displayOrder");
create index if not exists articles_enabled_idx       on public.articles ("isEnabled");

-- =====================================================================
-- 13. protocols
-- =====================================================================
create table if not exists public.protocols (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  category       text not null default 'general',
  dosage         text not null default '',
  frequency      text not null default '',
  duration       text not null default '',
  notes          jsonb not null default '[]'::jsonb,
  storage        text not null default '',
  "sortOrder"    integer not null default 0,
  active         boolean not null default true,
  "productId"    uuid references public.products(id) on delete set null,
  "imageUrl"     text,
  "contentType"  text,
  "fileUrl"      text,
  "_creationTime" bigint not null default (extract(epoch from now()) * 1000)::bigint
);
create index if not exists protocols_name_idx       on public.protocols (name);
create index if not exists protocols_sort_order_idx on public.protocols ("sortOrder");
create index if not exists protocols_product_idx    on public.protocols ("productId");

-- =====================================================================
-- Row Level Security
-- Public read on content tables; writes restricted to service role.
-- Orders: anyone can insert (checkout) and read by orderNumber/email lookup.
-- =====================================================================
alter table public.categories          enable row level security;
alter table public.products            enable row level security;
alter table public."productVariations" enable row level security;
alter table public."siteSettings"      enable row level security;
alter table public."paymentMethods"    enable row level security;
alter table public."shippingLocations" enable row level security;
alter table public.couriers            enable row level security;
alter table public."promoCodes"        enable row level security;
alter table public.orders              enable row level security;
alter table public."coaReports"        enable row level security;
alter table public.faqs                enable row level security;
alter table public.articles            enable row level security;
alter table public.protocols           enable row level security;

-- Public read policies (anon + authenticated)
do $$
declare t text;
begin
  foreach t in array array[
    'categories','products','productVariations','siteSettings','paymentMethods',
    'shippingLocations','couriers','promoCodes','coaReports','faqs','articles','protocols'
  ] loop
    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (true);',
      'public_read_' || t, t
    );
  end loop;
end$$;

-- Orders: anyone can insert (checkout), anyone can read (lookup by orderNumber).
-- For production you may want to tighten this with a token column.
create policy orders_public_insert on public.orders for insert to anon, authenticated with check (true);
create policy orders_public_select on public.orders for select to anon, authenticated using (true);
create policy orders_public_update on public.orders for update to anon, authenticated using (true) with check (true);

-- Admin writes are performed via the Supabase service role key (server-side / admin UI only).
-- The service_role bypasses RLS automatically; no extra policy is required for it.

-- =====================================================================
-- Storage bucket for images (products, COA, payment QR, articles, etc.)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do nothing;

-- Allow public read of bucket objects, anon upload (matches Convex behavior).
do $$
begin
  begin
    create policy "public_assets_read"
      on storage.objects for select to anon, authenticated
      using (bucket_id = 'public-assets');
  exception when duplicate_object then null; end;

  begin
    create policy "public_assets_write"
      on storage.objects for insert to anon, authenticated
      with check (bucket_id = 'public-assets');
  exception when duplicate_object then null; end;

  begin
    create policy "public_assets_update"
      on storage.objects for update to anon, authenticated
      using (bucket_id = 'public-assets')
      with check (bucket_id = 'public-assets');
  exception when duplicate_object then null; end;

  begin
    create policy "public_assets_delete"
      on storage.objects for delete to anon, authenticated
      using (bucket_id = 'public-assets');
  exception when duplicate_object then null; end;
end$$;
