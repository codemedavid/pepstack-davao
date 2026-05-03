-- Replace existing FAQ rows with the latest canonical list.
DELETE FROM faqs;

INSERT INTO faqs (question, answer, category, order_index, is_active) VALUES
('Are your products on-hand?', 'Yes. All products are on-hand unless stated otherwise.', 'ORDERING & PACKAGING', 1, true),
('What does "with inclusions" mean?', '"With inclusions" means the product comes with the listed included items shown on the product page.', 'ORDERING & PACKAGING', 2, true),
('Are prices fixed?', 'Prices may change without prior notice depending on supply, shipping, and sourcing costs.', 'ORDERING & PACKAGING', 3, true),
('Can I cancel my order after payment?', 'Once an order has been confirmed and prepared for processing, cancellation may no longer be allowed.', 'ORDERING & PACKAGING', 4, true),
('What if my order arrives damaged, incomplete, or incorrect?', 'Please contact us within 24 hours of receiving your order and provide clear photos and a full unboxing video, if available, so the issue can be reviewed properly.', 'ORDERING & PACKAGING', 5, true),
('Do you offer refunds or replacements after reconstitution?', 'No. Any gelling, cloudiness, clumping, contamination, or damage during or after reconstitution does not qualify for a refund or replacement.', 'ORDERING & PACKAGING', 6, true),

('Why do vial cap colors sometimes differ?', 'Vial cap colors may vary by batch and supplier availability. This does not automatically mean the product itself is different.', 'PRODUCT & USAGE', 7, true),
('Do you provide COAs?', 'COAs may be available for selected products when provided by the supplier or manufacturer.', 'PRODUCT & USAGE', 8, true),
('Are these FDA-approved?', 'No. Products on this site are provided as research compounds for in vitro / in vivo laboratory research only. They are not medications, are not FDA-approved, and are not intended for use in humans or animals.', 'PRODUCT & USAGE', 9, true),
('Do you provide medical advice?', 'No. Any guides, protocols, or information shared are for educational purposes only and are based on commonly seen references and personal experience. They do not replace medical advice, diagnosis, or treatment.', 'PRODUCT & USAGE', 10, true),
('Do you have a partner doctor?', 'No. It''s hard to prove their legitimacy especially since these consultations are done online. You might want to visit a doctor near you instead. Be careful.', 'PRODUCT & USAGE', 11, true),

('Do you offer COD?', 'No. We do not offer cash on delivery.', 'PAYMENT METHODS', 12, true),

('Where do you ship from?', 'Orders ship from Davao City.', 'SHIPPING & DELIVERY', 13, true),
('Do you do meet-ups or pick-ups?', 'We appreciate the interest, but we do not accommodate meet-ups or pick-ups at this time. All orders are shipped via courier.', 'SHIPPING & DELIVERY', 14, true),
('What courier do you use?', 'We usually ship via J&T. Local delivery options may be available depending on rider availability and location.', 'SHIPPING & DELIVERY', 15, true),
('When will my order be shipped?', 'Orders are processed in the order they are received. Orders placed after cut-off, on weekends, holidays, or outside business hours may be shipped the next business day.', 'SHIPPING & DELIVERY', 16, true),
('Do you accept rush orders?', 'No. All orders are processed in the order they are received.', 'SHIPPING & DELIVERY', 17, true),
('Can I track my order?', 'You can check your order status on the Track Order page using your Order ID, which is found in your order confirmation message. Tracking details are updated as they become available — I may not be able to message everyone individually once their order ships, so please check the Track Order page for updates.', 'SHIPPING & DELIVERY', 18, true),
('What if I entered the wrong shipping details?', 'Please contact us as soon as possible. Changes can only be made if the order has not yet been packed or shipped.', 'SHIPPING & DELIVERY', 19, true),
('What if my package is delayed?', 'Once shipped, delivery speed depends on the courier. Delays caused by the courier, weather, customs, holidays, or other external factors are beyond our control.', 'SHIPPING & DELIVERY', 20, true);
