
-- Migration: Add "Complete Set" variation to every product except Lemon Bottle,
-- and add a standalone "Complete Set Inclusions" add-on product at ₱150.
--
-- Complete Set Inclusions kit contains:
--   1 Storage Box, 6 Insulin Syringes, 1 3ml Syringe, 8 Alcohol Pads
--
-- The "Complete Set" variation price = base_price + 150 (the kit upcharge).

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) Add a "Complete Set" variation to every eligible product
--    Skips: products whose name contains "Lemon Bottle" (case-insensitive)
--    Skips: products that already have a "Complete Set" variation
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO product_variations (product_id, name, quantity_mg, price, stock_quantity, discount_active)
SELECT
  p.id,
  'Complete Set',
  COALESCE((SELECT MAX(quantity_mg) FROM product_variations v WHERE v.product_id = p.id), 5.0),
  (p.base_price + 150)::numeric,
  GREATEST(p.stock_quantity, 0),
  false
FROM products p
WHERE p.name NOT ILIKE '%lemon bottle%'
  AND NOT EXISTS (
    SELECT 1
    FROM product_variations v
    WHERE v.product_id = p.id
      AND v.name ILIKE 'complete set'
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) Ensure the "Add-Ons" category exists (idempotent)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO categories (id, name, icon, sort_order, active)
SELECT gen_random_uuid(), 'Add-Ons', '🛒', 99, true
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Add-Ons');

-- ─────────────────────────────────────────────────────────────────────────────
-- 3) Add standalone "Complete Set Inclusions" add-on product at ₱150
--    (Idempotent: only inserts if not already present)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO products (
  name,
  description,
  base_price,
  category,
  available,
  featured,
  stock_quantity,
  purity_percentage,
  storage_conditions,
  inclusions
)
SELECT
  'Complete Set Inclusions',
  'Optional add-on kit. Add this to any product to get the complete set supplies.',
  150.00,
  (SELECT id::text FROM categories WHERE name = 'Add-Ons' LIMIT 1),
  true,
  false,
  1000,
  0,
  'Store in a cool, dry place',
  ARRAY[
    '1 Storage Box',
    '6 Insulin Syringes',
    '1 3ml Syringe',
    '8 Alcohol Pads'
  ]
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'Complete Set Inclusions'
);
