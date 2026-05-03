-- ============================================================================
-- PEPSTACK DAVAO — FULL SUPABASE SETUP
-- Run this entire file in: Supabase Dashboard → SQL Editor → RUN
-- Idempotent: safe to re-run.
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONS & HELPERS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.categories TO anon, authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Uncategorized',
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_price DECIMAL(10,2),
    discount_start_date TIMESTAMPTZ,
    discount_end_date TIMESTAMPTZ,
    discount_active BOOLEAN DEFAULT false,
    purity_percentage DECIMAL(5,2) DEFAULT 99.0,
    molecular_weight TEXT,
    cas_number TEXT,
    sequence TEXT,
    storage_conditions TEXT DEFAULT 'Store at -20°C',
    inclusions TEXT[],
    stock_quantity INTEGER DEFAULT 0,
    available BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    image_url TEXT,
    safety_sheet_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.products TO anon, authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.product_variations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity_mg DECIMAL(10,2) NOT NULL DEFAULT 0,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_price DECIMAL(10,2),
    discount_active BOOLEAN DEFAULT false,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.product_variations DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.product_variations TO anon, authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'text',
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.site_settings DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.site_settings TO anon, authenticated, service_role;
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    account_number TEXT,
    account_name TEXT,
    qr_code_url TEXT,
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.payment_methods DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.payment_methods TO anon, authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.shipping_locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    fee NUMERIC(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    order_index INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.shipping_locations DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.shipping_locations TO anon, authenticated, service_role;
CREATE INDEX IF NOT EXISTS shipping_locations_order_idx ON public.shipping_locations (order_index ASC);

CREATE TABLE IF NOT EXISTS public.couriers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    tracking_url_template TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.couriers DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.couriers TO anon, authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage','fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_purchase_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.promo_codes DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.promo_codes TO anon, authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    contact_method TEXT DEFAULT 'phone',
    shipping_address TEXT NOT NULL,
    shipping_city TEXT,
    shipping_state TEXT,
    shipping_zip_code TEXT,
    shipping_country TEXT DEFAULT 'Philippines',
    shipping_barangay TEXT,
    shipping_region TEXT,
    shipping_location TEXT,
    courier_id UUID,
    shipping_fee DECIMAL(10,2) DEFAULT 0,
    order_items JSONB NOT NULL,
    subtotal DECIMAL(10,2),
    total_price DECIMAL(10,2) NOT NULL,
    pricing_mode TEXT DEFAULT 'PHP',
    payment_method_id TEXT,
    payment_method_name TEXT,
    payment_status TEXT DEFAULT 'pending',
    payment_proof_url TEXT,
    promo_code_id UUID REFERENCES public.promo_codes(id),
    promo_code TEXT,
    discount_applied DECIMAL(10,2) DEFAULT 0,
    order_status TEXT DEFAULT 'new',
    notes TEXT,
    admin_notes TEXT,
    tracking_number TEXT,
    tracking_courier TEXT,
    shipping_provider TEXT,
    shipping_note TEXT,
    shipped_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.orders TO anon, authenticated, service_role;
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.coa_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name TEXT NOT NULL,
    batch TEXT,
    test_date DATE NOT NULL,
    purity_percentage DECIMAL(5,3) NOT NULL,
    quantity TEXT NOT NULL,
    task_number TEXT NOT NULL,
    verification_key TEXT NOT NULL,
    image_url TEXT NOT NULL,
    featured BOOLEAN DEFAULT false,
    manufacturer TEXT DEFAULT 'Peptide Pulse',
    laboratory TEXT DEFAULT 'Janoshik Analytical',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.coa_reports DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.coa_reports TO anon, authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'GENERAL',
    order_index INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.faqs DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.faqs TO anon, authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  notes TEXT[] DEFAULT '{}',
  storage TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  image_url TEXT,
  content_type TEXT NOT NULL DEFAULT 'text',
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.protocols ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read active protocols" ON public.protocols;
CREATE POLICY "Public can read active protocols" ON public.protocols FOR SELECT USING (active = true);
DROP POLICY IF EXISTS "Admins can manage protocols" ON public.protocols;
CREATE POLICY "Admins can manage protocols" ON public.protocols FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow full access to couriers" ON public.couriers;
CREATE POLICY "Allow full access to couriers" ON public.couriers FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- 3. RPC FUNCTIONS
-- ============================================================================
CREATE OR REPLACE FUNCTION get_order_details(p_order_id UUID)
RETURNS JSONB AS $$
DECLARE result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'id', o.id, 'customer_name', o.customer_name, 'customer_email', o.customer_email,
        'customer_phone', o.customer_phone, 'shipping_address', o.shipping_address,
        'shipping_city', o.shipping_city, 'shipping_fee', o.shipping_fee,
        'total_price', o.total_price, 'discount_applied', o.discount_applied,
        'promo_code', o.promo_code, 'payment_status', o.payment_status,
        'order_status', o.order_status, 'created_at', o.created_at,
        'items', o.order_items, 'tracking_number', o.tracking_number,
        'shipping_provider', o.shipping_provider, 'courier_code', c.code,
        'courier_name', c.name, 'tracking_url_template', c.tracking_url_template
    ) INTO result FROM public.orders o
    LEFT JOIN public.couriers c ON o.courier_id = c.id
    WHERE o.id = p_order_id;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. STORAGE BUCKETS & POLICIES
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('payment-proofs', 'payment-proofs', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('article-covers', 'article-covers', true, 5242880, ARRAY['image/jpeg','image/png','image/webp']),
  ('menu-images', 'menu-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('protocol-files', 'protocol-files', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Select" ON storage.objects;
CREATE POLICY "Public Select" ON storage.objects FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Public Insert" ON storage.objects;
CREATE POLICY "Public Insert" ON storage.objects FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE TO public USING (true);

DROP POLICY IF EXISTS "Public can read protocol files" ON storage.objects;
CREATE POLICY "Public can read protocol files" ON storage.objects FOR SELECT TO public USING (bucket_id = 'protocol-files');
DROP POLICY IF EXISTS "Anyone can upload protocol files" ON storage.objects;
CREATE POLICY "Anyone can upload protocol files" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'protocol-files');
DROP POLICY IF EXISTS "Anyone can update protocol files" ON storage.objects;
CREATE POLICY "Anyone can update protocol files" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'protocol-files');
DROP POLICY IF EXISTS "Anyone can delete protocol files" ON storage.objects;
CREATE POLICY "Anyone can delete protocol files" ON storage.objects FOR DELETE TO public USING (bucket_id = 'protocol-files');

-- ============================================================================
-- 5. SEED REFERENCE DATA
-- ============================================================================
INSERT INTO public.site_settings (id, value, type, description) VALUES
('site_name', 'Peptide Pulse', 'text', 'The name of the website'),
('site_logo', '/assets/logo.jpeg', 'image', 'The logo image URL for the site'),
('site_description', 'Premium Peptide Solutions', 'text', 'Short description of the site'),
('currency', '₱', 'text', 'Currency symbol for prices'),
('hero_title_prefix', 'Premium', 'text', 'Hero title prefix'),
('hero_title_highlight', 'Peptides', 'text', 'Hero title highlighted word'),
('hero_title_suffix', '& Essentials', 'text', 'Hero title suffix'),
('coa_page_enabled', 'true', 'boolean', 'Enable/disable the COA page')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.categories (id, name, sort_order, icon, active) VALUES
('c0a80121-0001-4e78-94f8-585d77059001', 'Peptides', 1, 'FlaskConical', true),
('c0a80121-0002-4e78-94f8-585d77059002', 'Weight Management', 2, 'Scale', true),
('c0a80121-0003-4e78-94f8-585d77059003', 'Beauty & Anti-Aging', 3, 'Sparkles', true),
('c0a80121-0004-4e78-94f8-585d77059004', 'Wellness & Vitality', 4, 'Heart', true),
('c0a80121-0005-4e78-94f8-585d77059005', 'GLP-1 Agonists', 5, 'Pill', true),
('c0a80121-0006-4e78-94f8-585d77059006', 'Insulin Pens', 6, 'Syringe', true),
('c0a80121-0007-4e78-94f8-585d77059007', 'Accessories', 7, 'Package', true),
('c0a80121-0008-4e78-94f8-585d77059008', 'Bundles & Kits', 8, 'Gift', true),
('c0a80121-0009-4e78-94f8-585d77059009', 'Complete Sets', 9, 'Package', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.couriers (code, name, tracking_url_template, is_active) VALUES
('lbc', 'LBC Express', 'https://www.lbcexpress.com/track/?tracking_no={tracking}', true),
('jnt', 'J&T Express', 'https://www.jtexpress.ph/index/query/gzquery.html?bills={tracking}', true),
('lalamove', 'Lalamove', NULL, true),
('grab', 'Grab Express', NULL, true),
('maxim', 'Maxim', NULL, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.shipping_locations (id, name, fee, is_active, order_index) VALUES
('LBC_METRO_MANILA', 'LBC - Metro Manila', 150.00, true, 1),
('LBC_LUZON', 'LBC - Luzon (Provincial)', 200.00, true, 2),
('LBC_VISMIN', 'LBC - Visayas & Mindanao', 250.00, true, 3),
('JNT_METRO_MANILA', 'J&T - Metro Manila', 120.00, true, 4),
('JNT_PROVINCIAL', 'J&T - Provincial', 180.00, true, 5),
('LALAMOVE_STANDARD', 'Lalamove (Book Yourself / Rider)', 0.00, true, 6),
('MAXIM_STANDARD', 'Maxim (Book Yourself / Rider)', 0.00, true, 7),
('NCR', 'NCR (Metro Manila)', 75, true, 8),
('LUZON', 'Luzon (Outside NCR)', 100, true, 9),
('VISAYAS_MINDANAO', 'Visayas & Mindanao', 130, true, 10)
ON CONFLICT (id) DO UPDATE SET fee = EXCLUDED.fee, name = EXCLUDED.name;

INSERT INTO public.payment_methods (id, name, account_number, account_name, active, sort_order) VALUES
('0a0b0001-0001-4e78-94f8-585d77059001', 'GCash', '', 'Peptide Pulse', true, 1),
('0a0b0002-0002-4e78-94f8-585d77059002', 'BDO', '', 'Peptide Pulse', true, 2),
('0a0b0003-0003-4e78-94f8-585d77059003', 'Security Bank', '', 'Peptide Pulse', true, 3)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 6. SEED PEPSTACK PRICE LIST (15 products + variations)
-- ============================================================================
WITH new_products(name, description, base_price, category, featured, stock_quantity, inclusions) AS (
  VALUES
    ('Tirzepatide 15mg + 3ml bac', 'GLP-1/GIP dual agonist for weight management. 15mg vial with 3ml bacteriostatic water.', 830::numeric, 'c0a80121-0002-4e78-94f8-585d77059002', true, 0, NULL::text[]),
    ('Tirzepatide 30mg + 3ml bac', 'GLP-1/GIP dual agonist for weight management. 30mg vial with 3ml bacteriostatic water.', 990, 'c0a80121-0002-4e78-94f8-585d77059002', true, 0, NULL),
    ('Lemon Bottle', 'Lipolytic solution for fat dissolving treatments.', 750, 'c0a80121-0002-4e78-94f8-585d77059002', true, 0, NULL),
    ('Lipo Vela', 'Lipolytic injection for targeted fat reduction.', 550, 'c0a80121-0002-4e78-94f8-585d77059002', false, 0, NULL),
    ('Aqualyx', 'Aqueous solution for non-surgical fat reduction.', 400, 'c0a80121-0002-4e78-94f8-585d77059002', false, 10, NULL),
    ('L-carnitine', 'Amino acid derivative supporting fat metabolism and energy.', 900, 'c0a80121-0002-4e78-94f8-585d77059002', false, 0, NULL),
    ('GHK-Cu 50mg + 3ml bac', 'Copper peptide for skin rejuvenation and elasticity. 50mg vial with 3ml bacteriostatic water.', 650, 'c0a80121-0003-4e78-94f8-585d77059003', true, 10, NULL),
    ('GHK-Cu 100mg + 10ml bac', 'Copper peptide for skin rejuvenation and elasticity. 100mg vial with 10ml bacteriostatic water.', 800, 'c0a80121-0003-4e78-94f8-585d77059003', false, 10, NULL),
    ('KPV 10mg + 3ml bac', 'Anti-inflammatory peptide for skin and gut health. 10mg vial with 3ml bacteriostatic water.', 800, 'c0a80121-0003-4e78-94f8-585d77059003', false, 10, NULL),
    ('Fuan Gluta 1500 + 10ml bac', 'Glutathione 1500mg for antioxidant support and skin glow. With 10ml bacteriostatic water.', 950, 'c0a80121-0003-4e78-94f8-585d77059003', false, 10, NULL),
    ('NAD 500mg + 10ml bac', 'NAD+ for cellular energy, longevity, and recovery. 500mg vial with 10ml bacteriostatic water.', 880, 'c0a80121-0004-4e78-94f8-585d77059004', true, 10, NULL),
    ('Lipo-C w/ B12', 'Lipotropic blend with vitamin B12 for energy and metabolic support.', 750, 'c0a80121-0004-4e78-94f8-585d77059004', false, 0, NULL),
    ('Tirzepatide 15mg Complete Set', 'Tirzepatide 15mg complete starter set with all reconstitution supplies included.', 980, 'c0a80121-0009-4e78-94f8-585d77059009', true, 0, ARRAY['1pc Pep','1pc bac water','8pcs alcohol pads','1pc recon syringe','6pcs insulin syringe']),
    ('Tirzepatide 30mg Complete Set', 'Tirzepatide 30mg complete starter set with all reconstitution supplies included.', 1140, 'c0a80121-0009-4e78-94f8-585d77059009', true, 0, ARRAY['1pc Pep','1pc bac water','8pcs alcohol pads','1pc recon syringe','6pcs insulin syringe']),
    ('Lemon Bottle Complete Set', 'Lemon Bottle complete set with all supplies included. Includes 10pcs insulin syringes.', 950, 'c0a80121-0009-4e78-94f8-585d77059009', true, 0, ARRAY['1pc Pep','1pc bac water','8pcs alcohol pads','1pc recon syringe','10pcs insulin syringe'])
)
INSERT INTO public.products (name, description, base_price, category, featured, available, stock_quantity, inclusions)
SELECT n.name, n.description, n.base_price, n.category, n.featured, true, n.stock_quantity, n.inclusions
FROM new_products n
WHERE NOT EXISTS (SELECT 1 FROM public.products p WHERE p.name = n.name);

UPDATE public.products SET
  description = u.description, base_price = u.base_price, category = u.category,
  featured = u.featured, stock_quantity = u.stock_quantity, inclusions = u.inclusions, available = true
FROM (VALUES
    ('Tirzepatide 15mg + 3ml bac', 'GLP-1/GIP dual agonist for weight management. 15mg vial with 3ml bacteriostatic water.', 830::numeric, 'c0a80121-0002-4e78-94f8-585d77059002', true, 0, NULL::text[]),
    ('Tirzepatide 30mg + 3ml bac', 'GLP-1/GIP dual agonist for weight management. 30mg vial with 3ml bacteriostatic water.', 990, 'c0a80121-0002-4e78-94f8-585d77059002', true, 0, NULL),
    ('Lemon Bottle', 'Lipolytic solution for fat dissolving treatments.', 750, 'c0a80121-0002-4e78-94f8-585d77059002', true, 0, NULL),
    ('Lipo Vela', 'Lipolytic injection for targeted fat reduction.', 550, 'c0a80121-0002-4e78-94f8-585d77059002', false, 0, NULL),
    ('Aqualyx', 'Aqueous solution for non-surgical fat reduction.', 400, 'c0a80121-0002-4e78-94f8-585d77059002', false, 10, NULL),
    ('L-carnitine', 'Amino acid derivative supporting fat metabolism and energy.', 900, 'c0a80121-0002-4e78-94f8-585d77059002', false, 0, NULL),
    ('GHK-Cu 50mg + 3ml bac', 'Copper peptide for skin rejuvenation and elasticity. 50mg vial with 3ml bacteriostatic water.', 650, 'c0a80121-0003-4e78-94f8-585d77059003', true, 10, NULL),
    ('GHK-Cu 100mg + 10ml bac', 'Copper peptide for skin rejuvenation and elasticity. 100mg vial with 10ml bacteriostatic water.', 800, 'c0a80121-0003-4e78-94f8-585d77059003', false, 10, NULL),
    ('KPV 10mg + 3ml bac', 'Anti-inflammatory peptide for skin and gut health. 10mg vial with 3ml bacteriostatic water.', 800, 'c0a80121-0003-4e78-94f8-585d77059003', false, 10, NULL),
    ('Fuan Gluta 1500 + 10ml bac', 'Glutathione 1500mg for antioxidant support and skin glow. With 10ml bacteriostatic water.', 950, 'c0a80121-0003-4e78-94f8-585d77059003', false, 10, NULL),
    ('NAD 500mg + 10ml bac', 'NAD+ for cellular energy, longevity, and recovery. 500mg vial with 10ml bacteriostatic water.', 880, 'c0a80121-0004-4e78-94f8-585d77059004', true, 10, NULL),
    ('Lipo-C w/ B12', 'Lipotropic blend with vitamin B12 for energy and metabolic support.', 750, 'c0a80121-0004-4e78-94f8-585d77059004', false, 0, NULL),
    ('Tirzepatide 15mg Complete Set', 'Tirzepatide 15mg complete starter set with all reconstitution supplies included.', 980, 'c0a80121-0009-4e78-94f8-585d77059009', true, 0, ARRAY['1pc Pep','1pc bac water','8pcs alcohol pads','1pc recon syringe','6pcs insulin syringe']),
    ('Tirzepatide 30mg Complete Set', 'Tirzepatide 30mg complete starter set with all reconstitution supplies included.', 1140, 'c0a80121-0009-4e78-94f8-585d77059009', true, 0, ARRAY['1pc Pep','1pc bac water','8pcs alcohol pads','1pc recon syringe','6pcs insulin syringe']),
    ('Lemon Bottle Complete Set', 'Lemon Bottle complete set with all supplies included. Includes 10pcs insulin syringes.', 950, 'c0a80121-0009-4e78-94f8-585d77059009', true, 0, ARRAY['1pc Pep','1pc bac water','8pcs alcohol pads','1pc recon syringe','10pcs insulin syringe'])
) AS u(name, description, base_price, category, featured, stock_quantity, inclusions)
WHERE products.name = u.name;

DELETE FROM public.product_variations
WHERE product_id IN (SELECT id FROM public.products WHERE name IN (
  'Tirzepatide 15mg + 3ml bac','Tirzepatide 30mg + 3ml bac','Lemon Bottle','Lipo Vela','Aqualyx','L-carnitine',
  'GHK-Cu 50mg + 3ml bac','GHK-Cu 100mg + 10ml bac','KPV 10mg + 3ml bac','Fuan Gluta 1500 + 10ml bac',
  'NAD 500mg + 10ml bac','Lipo-C w/ B12','Tirzepatide 15mg Complete Set','Tirzepatide 30mg Complete Set','Lemon Bottle Complete Set'
));

INSERT INTO public.product_variations (product_id, name, quantity_mg, price, stock_quantity)
SELECT id, 'Vial', 15, 830, 0 FROM public.products WHERE name = 'Tirzepatide 15mg + 3ml bac' UNION ALL
SELECT id, 'Vial', 30, 990, 0 FROM public.products WHERE name = 'Tirzepatide 30mg + 3ml bac' UNION ALL
SELECT id, 'Vial', 0, 750, 0 FROM public.products WHERE name = 'Lemon Bottle' UNION ALL
SELECT id, 'Vial', 0, 550, 0 FROM public.products WHERE name = 'Lipo Vela' UNION ALL
SELECT id, 'Vial', 0, 400, 10 FROM public.products WHERE name = 'Aqualyx' UNION ALL
SELECT id, 'Vial', 0, 900, 0 FROM public.products WHERE name = 'L-carnitine' UNION ALL
SELECT id, 'Vial', 50, 650, 10 FROM public.products WHERE name = 'GHK-Cu 50mg + 3ml bac' UNION ALL
SELECT id, 'Vial', 100, 800, 10 FROM public.products WHERE name = 'GHK-Cu 100mg + 10ml bac' UNION ALL
SELECT id, 'Vial', 10, 800, 10 FROM public.products WHERE name = 'KPV 10mg + 3ml bac' UNION ALL
SELECT id, 'Vial', 1500, 950, 10 FROM public.products WHERE name = 'Fuan Gluta 1500 + 10ml bac' UNION ALL
SELECT id, 'Vial', 500, 880, 10 FROM public.products WHERE name = 'NAD 500mg + 10ml bac' UNION ALL
SELECT id, 'Vial', 0, 750, 0 FROM public.products WHERE name = 'Lipo-C w/ B12' UNION ALL
SELECT id, 'Complete Set', 15, 980, 0 FROM public.products WHERE name = 'Tirzepatide 15mg Complete Set' UNION ALL
SELECT id, 'Complete Set', 30, 1140, 0 FROM public.products WHERE name = 'Tirzepatide 30mg Complete Set' UNION ALL
SELECT id, 'Complete Set', 0, 950, 0 FROM public.products WHERE name = 'Lemon Bottle Complete Set';

-- ============================================================================
-- 7. RELOAD SCHEMA CACHE
-- ============================================================================
NOTIFY pgrst, 'reload schema';
