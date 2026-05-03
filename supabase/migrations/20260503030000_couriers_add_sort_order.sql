-- Frontend (useCouriers) and admin (CourierManager) both expect a sort_order
-- column. Without it, the SELECT errors out and the courier list is empty.
ALTER TABLE couriers
    ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

UPDATE couriers SET sort_order = 1 WHERE code = 'jnt';
UPDATE couriers SET sort_order = 2 WHERE code = 'lbc';
UPDATE couriers SET sort_order = 3 WHERE code = 'lalamove';
UPDATE couriers SET sort_order = 4 WHERE code = 'grab';
UPDATE couriers SET sort_order = 5 WHERE code = 'maxim';
