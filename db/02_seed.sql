INSERT IGNORE INTO users (id, name, email, password) VALUES
(1, 'Aisha Khan', 'aisha@university.edu', '$2b$10$xyzFakeHash1234567890'),
(2, 'Sam Patel', 'sam@university.edu', '$2b$10$xyzFakeHash1234567890'),
(3, 'Neha Thapa', 'neha@university.edu', '$2b$10$xyzFakeHash1234567890'),
(4, 'David Chen', 'david@university.edu', '$2b$10$xyzFakeHash1234567890'),
(5, 'Maria Gomez', 'maria@university.edu', '$2b$10$xyzFakeHash1234567890');

INSERT INTO tags (name) VALUES
('vegetarian'), ('vegan'), ('halal'), ('nuts'), ('dairy-free'), ('gluten-free')
ON DUPLICATE KEY UPDATE name=name;

-- Exactly 5 Categories
INSERT INTO categories (name) VALUES
('Produce'), ('Bakery'), ('Packaged'), ('Prepared'), ('Dairy & Eggs')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO items (id, user_id, title, description, expiry_date, pickup_location, status) VALUES
(1, 1, 'Bread expiring tomorrow', 'Unopened loaf, kept in a cool place.', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'Main Campus Library', 'Available'),
(2, 1, 'Extra vegetables', 'Mixed veg: carrots, onions, peppers.', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'Student Union Building', 'Available'),
(3, 3, 'Cooked curry portions', 'Homemade curry (mild). Please ask about ingredients.', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'Engineering Block A', 'Available'),
(4, 2, 'Half gallon of Milk', 'Unopened 2% milk.', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'Dorm 4, Lobby', 'Available'),
(5, 4, 'Apples and Oranges', 'Fresh fruit, bought too much.', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Science Center Cafe', 'Available'),
(6, 5, 'Unopened Cereal Box', 'Corn flakes, brand new.', DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'Math Department Lounge', 'Available'),
(7, 3, 'Leftover Veggie Pizza', '3 slices of vegetarian pizza from last night.', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'Engineering Block B', 'Available'),
(8, 1, 'Fresh Croissants', '2 butter croissants left from morning meeting.', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'Main Campus Library', 'Available'),
(9, 2, 'Cheddar Cheese Block', 'Unopened sharp cheddar.', DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'Dorm 4, Lobby', 'Available'),
(10, 4, 'Canned Beans and Corn', '3 cans total, good until next year.', DATE_ADD(CURDATE(), INTERVAL 180 DAY), 'Science Center Cafe', 'Available'),
(11, 5, 'Homemade Veggie Soup', 'Made a large batch, have one extra tupperware to share.', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'Math Department Lounge', 'Available'),
(12, 1, 'Bagels', '3 plain bagels.', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'Main Campus Library', 'Available'),
(13, 2, 'Pack of Yogurt', '4 individual cups of strawberry yogurt.', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Dorm 4, Lobby', 'Available'),
(14, 4, 'Fresh Spinach Bag', 'Unopened pre-washed spinach.', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'Science Center Cafe', 'Available'),
(15, 3, 'Chocolate Chip Cookies', 'Baked fresh yesterday, contain egg/dairy.', DATE_ADD(CURDATE(), INTERVAL 4 DAY), 'Engineering Block A', 'Available'),
(16, 5, 'Unopened Pasta Bag', '1 lb of penne pasta.', DATE_ADD(CURDATE(), INTERVAL 100 DAY), 'Math Department Lounge', 'Available')
AS new ON DUPLICATE KEY UPDATE title=new.title;

-- Map items to Categories
INSERT IGNORE INTO item_categories (item_id, category_id)
SELECT 1, id FROM categories WHERE name IN ('Bakery') UNION ALL
SELECT 2, id FROM categories WHERE name IN ('Produce') UNION ALL
SELECT 3, id FROM categories WHERE name IN ('Prepared') UNION ALL
SELECT 4, id FROM categories WHERE name IN ('Dairy & Eggs') UNION ALL
SELECT 5, id FROM categories WHERE name IN ('Produce') UNION ALL
SELECT 6, id FROM categories WHERE name IN ('Packaged') UNION ALL
SELECT 7, id FROM categories WHERE name IN ('Prepared') UNION ALL
SELECT 8, id FROM categories WHERE name IN ('Bakery') UNION ALL
SELECT 9, id FROM categories WHERE name IN ('Dairy & Eggs') UNION ALL
SELECT 10, id FROM categories WHERE name IN ('Packaged') UNION ALL
SELECT 11, id FROM categories WHERE name IN ('Prepared') UNION ALL
SELECT 12, id FROM categories WHERE name IN ('Bakery') UNION ALL
SELECT 13, id FROM categories WHERE name IN ('Dairy & Eggs') UNION ALL
SELECT 14, id FROM categories WHERE name IN ('Produce') UNION ALL
SELECT 15, id FROM categories WHERE name IN ('Bakery') UNION ALL
SELECT 16, id FROM categories WHERE name IN ('Packaged');

-- Map items to Tags
INSERT IGNORE INTO item_tags (item_id, tag_id)
SELECT 1, id FROM tags WHERE name IN ('vegetarian') UNION ALL
SELECT 2, id FROM tags WHERE name IN ('vegetarian', 'vegan', 'dairy-free') UNION ALL
SELECT 3, id FROM tags WHERE name IN ('halal') UNION ALL
SELECT 4, id FROM tags WHERE name IN ('vegetarian') UNION ALL
SELECT 5, id FROM tags WHERE name IN ('vegan', 'vegetarian', 'dairy-free', 'gluten-free') UNION ALL
SELECT 6, id FROM tags WHERE name IN ('vegetarian') UNION ALL
SELECT 7, id FROM tags WHERE name IN ('vegetarian') UNION ALL
SELECT 8, id FROM tags WHERE name IN ('vegetarian') UNION ALL
SELECT 9, id FROM tags WHERE name IN ('vegetarian', 'gluten-free') UNION ALL
SELECT 10, id FROM tags WHERE name IN ('vegan', 'vegetarian', 'dairy-free', 'gluten-free') UNION ALL
SELECT 11, id FROM tags WHERE name IN ('vegan', 'vegetarian', 'dairy-free', 'gluten-free') UNION ALL
SELECT 12, id FROM tags WHERE name IN ('vegetarian', 'vegan') UNION ALL
SELECT 13, id FROM tags WHERE name IN ('vegetarian', 'gluten-free') UNION ALL
SELECT 14, id FROM tags WHERE name IN ('vegan', 'vegetarian', 'dairy-free', 'gluten-free') UNION ALL
SELECT 15, id FROM tags WHERE name IN ('vegetarian') UNION ALL
SELECT 16, id FROM tags WHERE name IN ('vegan', 'vegetarian', 'dairy-free');

INSERT IGNORE INTO claims (item_id, user_id, status) VALUES
(1, 2, 'Active');

INSERT IGNORE INTO messages (item_id, sender_id, receiver_id, content) VALUES
(1, 2, 1, 'Hi, I would like to collect the bread tomorrow morning if possible?');
