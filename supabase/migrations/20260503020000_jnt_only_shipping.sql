-- Set J&T as the only active courier.
UPDATE couriers SET is_active = false WHERE code <> 'jnt';
UPDATE couriers SET is_active = true WHERE code = 'jnt';

-- Reset shipping locations to J&T-only with new flat rates.
UPDATE shipping_locations SET is_active = false;

INSERT INTO shipping_locations (id, name, fee, is_active, order_index) VALUES
    ('JNT_MINDANAO', 'J&T - Mindanao', 80,  true, 1),
    ('JNT_VISAYAS',  'J&T - Visayas',  100, true, 2),
    ('JNT_LUZON',    'J&T - Luzon',    120, true, 3)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    fee = EXCLUDED.fee,
    is_active = EXCLUDED.is_active,
    order_index = EXCLUDED.order_index;
