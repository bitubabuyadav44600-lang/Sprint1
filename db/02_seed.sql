INSERT INTO users (full_name, email, area, bio) VALUES
('Aisha Khan', 'aisha@example.com', 'Manchester', 'Often has extra groceries and wants to help.'),
('Sam Patel', 'sam@example.com', 'Salford', 'Student looking to reduce food spending.'),
('Neha Thapa', 'neha@example.com', 'London', 'Enjoys cooking; shares extra portions.');

INSERT INTO tags (name) VALUES
('vegetarian'), ('vegan'), ('halal'), ('nuts'), ('dairy'), ('gluten'), ('freezer-friendly'), ('evening-pickup')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO listings (user_id, title, description, quantity, expiry_date, pickup_location, pickup_window, status) VALUES
(1, 'Bread expiring tomorrow', 'Unopened loaf, kept in a cool place.', '1 loaf', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'Near Piccadilly Gardens', 'Today 6pm–8pm', 'available'),
(1, 'Extra vegetables', 'Mixed veg: carrots, onions, peppers.', '1 bag', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'Manchester Central Library', 'Tomorrow 5pm–7pm', 'available'),
(3, 'Cooked curry portions', 'Homemade curry (mild). Please ask about ingredients.', '2 portions', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'King\'s Cross Station area', 'Today 7pm–9pm', 'available');

INSERT INTO listing_tags (listing_id, tag_id)
SELECT 1, id FROM tags WHERE name IN ('evening-pickup');

INSERT INTO listing_tags (listing_id, tag_id)
SELECT 2, id FROM tags WHERE name IN ('vegetarian','vegan');

INSERT INTO listing_tags (listing_id, tag_id)
SELECT 3, id FROM tags WHERE name IN ('halal','evening-pickup');
