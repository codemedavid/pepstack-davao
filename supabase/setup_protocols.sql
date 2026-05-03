-- ============================================================
-- PROTOCOLS: Schema + Policies + Seed Data (idempotent)
-- Safe to run repeatedly in Supabase SQL Editor.
-- ============================================================

-- 1. Table
CREATE TABLE IF NOT EXISTS protocols (
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
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;

-- 3. Policies (drop-then-create so this script is re-runnable)
DROP POLICY IF EXISTS "Public can read active protocols" ON protocols;
DROP POLICY IF EXISTS "Admins can manage protocols" ON protocols;

CREATE POLICY "Public can read active protocols" ON protocols
  FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage protocols" ON protocols
  FOR ALL USING (true);

-- 4. Seed data
DELETE FROM protocols;

INSERT INTO protocols (name, category, dosage, frequency, duration, notes, storage, sort_order, active) VALUES

-- Tirzepatide
('Tirzepetide 15MG Protocol', 'Weight Management', '2.5mg - 7.5mg weekly (dose based on vial size)', 'Once weekly on the same day', '12-16 weeks per cycle',
 ARRAY['Start with 2.5mg for first 4 weeks', 'Increase by 2.5mg every 4 weeks as tolerated', 'This is the 15mg vial - yields multiple doses', 'Inject subcutaneously in abdomen, thigh, or upper arm', 'Take with or without food', 'Rotate injection sites'],
 'Refrigerate at 2-8°C. Once in use, can be kept at room temperature for up to 21 days.', 1, true),

('Tirzepetide 30MG Protocol', 'Weight Management', '5mg - 15mg weekly (higher dose vial)', 'Once weekly on the same day', '12-16 weeks per cycle',
 ARRAY['Start with 5mg for first 4 weeks if experienced', 'Increase by 2.5-5mg every 4 weeks as tolerated', 'Maximum dose is 15mg weekly', 'This larger vial offers more flexibility', 'Inject subcutaneously', 'May cause nausea initially - eat smaller meals'],
 'Refrigerate at 2-8°C.', 2, true),

-- NAD+
('NAD+ 500MG Protocol', 'Longevity & Anti-Aging', '100mg - 250mg daily', 'Once daily, preferably morning', '8-12 weeks per cycle',
 ARRAY['Start with 100mg and increase gradually', 'Subcutaneous or intramuscular injection', 'Higher dose vial allows extended use', 'Take in morning to avoid sleep disruption', 'Supports cellular energy and repair', 'Some initial flushing is normal'],
 'Refrigerate after reconstitution. Protect from light.', 3, true),

-- GHK-Cu
('GHK CU 50MG Protocol', 'Beauty & Regeneration', '1mg - 2mg daily', 'Once daily', '8-12 weeks per cycle',
 ARRAY['Can be used topically or via injection', 'Promotes collagen synthesis', 'Supports skin elasticity and wound healing', 'Also used for hair regrowth', 'Copper peptide with many benefits', 'Safe for long-term use'],
 'Refrigerate after reconstitution.', 4, true),

('GHK CU 100MG Protocol', 'Beauty & Regeneration', '2mg - 3mg daily', 'Once daily', '8-12 weeks per cycle',
 ARRAY['Higher concentration for extended protocols', 'Excellent for anti-aging protocols', 'Can inject near treatment area', 'Supports tissue repair', 'Works synergistically with other peptides', 'Monitor for copper sensitivity'],
 'Refrigerate after reconstitution.', 5, true),

-- DSIP
('DSIP 5MG Protocol', 'Sleep & Recovery', '100mcg - 300mcg before bed', 'Once daily, 30 min before sleep', '2-4 weeks per cycle',
 ARRAY['Start with 100mcg to assess tolerance', 'Promotes deep, restorative sleep', 'Do not combine with other sedatives', 'Effects build over several days', 'Take 2-4 week breaks between cycles', 'Subcutaneous injection preferred'],
 'Refrigerate after reconstitution.', 6, true),

('DSIP 15MG Protocol', 'Sleep & Recovery', '200mcg - 400mcg before bed', 'Once daily, 30 min before sleep', '4-6 weeks per cycle',
 ARRAY['Larger vial for extended sleep support', 'Gradually increase dose as needed', 'Supports natural sleep architecture', 'May help with stress-related insomnia', 'Avoid alcohol when using', 'Take breaks to prevent tolerance'],
 'Refrigerate after reconstitution.', 7, true),

-- Glutathione
('Glutathione 1500MG Protocol', 'Detox & Skin Brightening', '200mg - 500mg every other day', '3-4 times weekly', '8-12 weeks per cycle',
 ARRAY['Master antioxidant for detoxification', 'Skin brightening and evening tone', 'Can inject subcutaneously or intramuscularly', 'Often combined with Vitamin C', 'Supports liver function', 'Results visible after 4-6 weeks'],
 'Refrigerate. Protect from light and heat.', 8, true),

-- Lipo-C with B12
('Lipo C with B12 Protocol', 'Fat Burning & Energy', '1ml injection', '2-3 times weekly', 'Ongoing or 8-12 week cycles',
 ARRAY['Lipotropic injection for fat metabolism', 'Boosts energy and metabolism', 'Inject intramuscularly in thigh or buttock', 'Best combined with exercise program', 'Supports liver fat processing', 'B12 provides energy boost'],
 'Refrigerate. Protect from light.', 9, true),

-- SS-31
('SS31 10MG Protocol', 'Mitochondrial Health', '5mg - 10mg daily', 'Once daily', '4-6 weeks per cycle',
 ARRAY['Targets inner mitochondrial membrane', 'Protects against oxidative stress', 'Supports cellular energy production', 'Inject subcutaneously', 'Best taken in morning', 'Take 4-week breaks between cycles'],
 'Refrigerate. Protect from light.', 10, true),

('SS31 50MG Protocol', 'Mitochondrial Health', '10mg - 20mg daily', 'Once daily', '4-8 weeks per cycle',
 ARRAY['Higher dose for intensive protocols', 'Advanced mitochondrial support', 'Anti-aging at cellular level', 'Monitor energy levels', 'May enhance exercise performance', 'Rotate injection sites'],
 'Refrigerate. Protect from light.', 11, true),

-- MOTS-C
('MOTS C 10MG Protocol', 'Metabolic Health', '5mg twice weekly', 'Twice weekly (e.g., Mon/Thu)', '8-12 weeks per cycle',
 ARRAY['Mitochondrial-derived peptide', 'Improves insulin sensitivity', 'Enhances exercise capacity', 'Take before exercise for best results', 'Supports metabolic health', 'Intramuscular or subcutaneous'],
 'Refrigerate after reconstitution.', 12, true),

('MOTS C 40MG Protocol', 'Metabolic Health', '10mg twice weekly', 'Twice weekly (e.g., Mon/Thu)', '8-12 weeks per cycle',
 ARRAY['Higher dose for intensive protocols', 'Enhanced metabolic optimization', 'Great for athletes and active users', 'Best taken pre-workout', 'Supports weight management', 'Monitor blood glucose if diabetic'],
 'Refrigerate after reconstitution.', 13, true),

-- KLOW
('KLOW (CU50+TB10+BC10+KPV10) Protocol', 'Healing & Anti-Inflammatory', 'As pre-mixed or follow component ratios', 'Once daily', '6-8 weeks per cycle',
 ARRAY['Powerful combination stack', 'GHK-Cu for regeneration', 'TB-500 for tissue repair', 'BPC-157 for healing', 'KPV for anti-inflammatory', 'All-in-one healing protocol'],
 'Refrigerate after reconstitution.', 14, true),

-- Lemon Bottle
('Lemon Bottle 10MG Protocol', 'Fat Dissolving', 'Apply as directed to treatment area', 'Weekly treatments', '4-6 sessions typically',
 ARRAY['Lipolytic solution for fat reduction', 'Professional application recommended', 'Targets stubborn fat deposits', 'Massage after application', 'Results visible after 2-3 sessions', 'Avoid strenuous exercise 24hrs after'],
 'Refrigerate. Keep away from direct sunlight.', 15, true),

-- KPV + GHKCu Combo
('KPV 10MG + GHKCu 50MG Protocol', 'Anti-Inflammatory & Regeneration', 'KPV: 200mcg + GHKCu: 1mg daily', 'Once daily', '6-8 weeks per cycle',
 ARRAY['Synergistic anti-inflammatory combo', 'KPV reduces inflammation', 'GHKCu promotes tissue repair', 'Great for skin and gut health', 'Subcutaneous injection', 'Can split doses AM/PM'],
 'Refrigerate after reconstitution.', 16, true),

-- Snap-8
('Snap-8 (Botox in a Bottle) Protocol', 'Anti-Wrinkle', 'Apply topically to wrinkle-prone areas', 'Twice daily', 'Ongoing use',
 ARRAY['Topical anti-wrinkle peptide', 'Apply to forehead, crows feet, frown lines', 'Works by relaxing facial muscles', 'Visible results in 2-4 weeks', 'Safe for daily use', 'Can layer under moisturizer'],
 'Store at room temperature. Keep sealed.', 17, true),

-- GHKCu Cosmetic Grade
('GHKCu Cosmetic Grade (1 gram) Protocol', 'Professional Cosmetic Use', 'Mix into serums: 0.1-0.5% concentration', 'Daily as part of skincare routine', 'Ongoing use',
 ARRAY['High-grade copper peptide powder', 'Mix into your preferred serum base', 'Start with lower concentration', 'Store mixed serum in dark bottle', 'Promotes collagen and elastin', 'Professional skincare formulation'],
 'Store powder in freezer. Mixed serum refrigerate.', 18, true),

-- Semax + Selank
('Semax 10MG + Selank 10MG Protocol', 'Cognitive Enhancement', 'Semax: 300mcg + Selank: 250mcg daily', '1-2 times daily', '2-4 weeks per cycle',
 ARRAY['Powerful nootropic combination', 'Semax for focus and memory', 'Selank for anxiety and stress', 'Intranasal or subcutaneous', 'Best taken morning/early afternoon', 'Take breaks between cycles'],
 'Refrigerate. Use within 30 days.', 19, true),

-- KPV
('KPV 5MG Protocol', 'Anti-Inflammatory', '100mcg - 200mcg daily', 'Once daily', '4-8 weeks per cycle',
 ARRAY['Potent anti-inflammatory peptide', 'Alpha-MSH fragment', 'Gut health and skin conditions', 'Subcutaneous injection', 'No significant side effects', 'Works systemically'],
 'Refrigerate after reconstitution.', 20, true),

('KPV 10MG Protocol', 'Anti-Inflammatory', '200mcg - 400mcg daily', 'Once or twice daily', '4-8 weeks per cycle',
 ARRAY['Higher dose for stronger effect', 'Excellent for inflammatory conditions', 'Can split dose morning/evening', 'Supports gut barrier function', 'Anti-microbial properties', 'Safe for extended use'],
 'Refrigerate after reconstitution.', 21, true),

-- Tesamorelin
('Tesamorelin 5MG Protocol', 'Growth Hormone', '1mg daily', 'Once daily before bed on empty stomach', '12-26 weeks per cycle',
 ARRAY['FDA-approved GHRH analog', 'Reduces visceral fat', 'Inject subcutaneously in abdomen', 'No food 2 hours before/after', 'Stimulates natural GH release', 'Monitor IGF-1 levels'],
 'Refrigerate at 2-8°C.', 22, true),

('Tesamorelin 10MG Protocol', 'Growth Hormone', '1mg - 2mg daily', 'Once daily before bed on empty stomach', '12-26 weeks per cycle',
 ARRAY['Larger vial for extended use', 'Same protocol as 5MG', 'Consistent timing important', 'Best taken before bed', 'Avoid eating after injection', 'Results visible after 8-12 weeks'],
 'Refrigerate at 2-8°C.', 23, true),

-- Epitalon
('Epitalon 10MG Protocol', 'Longevity & Anti-Aging', '5mg - 10mg daily for 10-20 days', 'Once daily, preferably before bed', '10-20 day cycles, 4-6 months apart',
 ARRAY['Telomere elongation peptide', 'Short intense cycles', 'Promotes melatonin production', 'Anti-aging at DNA level', 'Take 2-3 cycles per year', 'Subcutaneous injection'],
 'Refrigerate. Stable for 6 months.', 24, true),

('Epitalon 50MG Protocol', 'Longevity & Anti-Aging', '10mg daily for 10-20 days', 'Once daily, preferably before bed', '10-20 day cycles, 4-6 months apart',
 ARRAY['Higher dose vial for multiple cycles', 'Ultimate longevity peptide', 'Resets biological clock', 'Improves sleep quality', 'Supports immune function', 'Visible anti-aging effects'],
 'Refrigerate. Stable for 6 months.', 25, true),

-- PT-141
('PT141 10MG Protocol', 'Sexual Wellness', '500mcg - 2mg as needed', 'As needed, 1-2 hours before activity', 'Use as needed, 24hr minimum between doses',
 ARRAY['Also known as Bremelanotide', 'Start with 500mcg to assess tolerance', 'Effects last 24-72 hours', 'Inject subcutaneously 45min-2hrs before', 'May cause nausea initially', 'Maximum once per 24 hours'],
 'Refrigerate. Use within 30 days.', 26, true);
