-- ═══════════════════════════════════════════════════════════════════════
-- FORNO — seed data
-- Run this THIRD, after 01_schema.sql and 02_storage.sql.
-- Generated from the CATS / DISHES arrays in forno-redesign.html:
--   15 categories, 67 dishes, prices and photo URLs unchanged.
-- Safe to re-run: it upserts on the category slug and skips duplicate dishes.
-- ═══════════════════════════════════════════════════════════════════════

-- ───────────────────────────── categories ─────────────────────────────
insert into public.categories (slug, name_en, name_ar, sort_order) values
  ('soups', 'Soups', 'الشوربات', 10),
  ('pasta', 'Pasta', 'الباستا', 20),
  ('appetizer', 'Appetizer', 'المقبلات', 30),
  ('salads', 'Salads', 'السلطات', 40),
  ('main', 'Main Course', 'الأطباق الرئيسية', 50),
  ('pizza', 'Pizza', 'البيتزا', 60),
  ('risotto', 'Risotto', 'الريزوتو', 70),
  ('sandwich', 'Sandwich', 'السندويتش', 80),
  ('burger', 'Burger', 'البرجر', 90),
  ('side', 'Side Dish', 'الأطباق الجانبية', 100),
  ('juice', 'Fresh Juice', 'العصائر الطازجة', 110),
  ('mojito', 'Mojito', 'الموهيتو', 120),
  ('shake', 'Milk Shake', 'الميلك شيك', 130),
  ('soft', 'Soft Drink', 'المشروبات الغازية', 140),
  ('dessert', 'Dessert', 'الحلويات', 150)
on conflict (slug) do update set
  name_en    = excluded.name_en,
  name_ar    = excluded.name_ar,
  sort_order = excluded.sort_order;

-- ───────────────────────────── menu items ─────────────────────────────
with src (slug, name_en, description_en, price, image_url, sort_order) as (values
  ('soups', 'Cream Chicken Soup', 'Chicken, corn, cream served with crispy garlic bread.', 30, 'https://forno-qa.site/imgPro/1747249847.jpg', 10),
  ('pasta', 'Roll Pasta mix sauce', 'Chicken pieces, fusilli pasta, mixed vegetable, cooking cream, tomato sauce and parmesan cheese', 39, 'https://forno-qa.site/imgPro/1747243779.jpg', 10),
  ('pasta', 'Bandolini Pasta', 'Penne pasta, noodles, chicken pieces, chopped onion, minced garlic. Topped with cream cheese and chopped parsley', 38, 'https://forno-qa.site/imgPro/1747244458.jpg', 20),
  ('pasta', 'Penne Alfredo Mix Sauce', 'Chicken pieces, cooking cream, Italian red tomato sauce, parmesan cheese and herbs.', 38, 'https://forno-qa.site/imgPro/1747246784.jpg', 30),
  ('pasta', 'Polo Forno', 'Penne pasta, basil pesto sauce, cooking cream, chicken and mozzarella cheese', 53, 'https://forno-qa.site/imgPro/1747246876.jpg', 40),
  ('pasta', 'Lava Cheese Pasta', 'Creamy fusilli pasta with melted cheese, Forno’s special pink sauce, and marinated chicken — rich, flavorful, and irresistibly satisfying.', 37, 'https://forno-qa.site/imgPro/1776805537.jpg', 50),
  ('pasta', 'Chicken Lasagna', 'Traditional Italian lasagna with chicken bolognaise, béchamel sauce and mozzarella cheese.', 46, 'https://forno-qa.site/imgPro/1747243868.jpg', 60),
  ('pasta', 'Spaghetti Bolognese Pasta', 'Choice of your spaghetti beef or chicken or plain spaghetti pasta', 39, 'https://forno-qa.site/imgPro/1747243945.jpg', 70),
  ('pasta', 'Penne Alfredo White Sauce', 'Penne pasta, chicken, parmesan cheese, white sauce, chopped parsley', 40, 'https://forno-qa.site/imgPro/1747244244.jpg', 80),
  ('pasta', 'Carbonara', 'Fettuccine pasta, smoked beef, cooking cream and parmesan cheese.', 40, 'https://forno-qa.site/imgPro/1747244575.jpg', 90),
  ('pasta', 'Fettuccine Pesto', 'Homemade basil pesto, mixed veggies, cooking cream and parmesan cheese.', 40, 'https://forno-qa.site/imgPro/1747246049.jpg', 100),
  ('pasta', 'Mushroom Pasta', 'Penne pasta, cooking cream, mushroom and parmesan cheese.', 40, 'https://forno-qa.site/imgPro/1747246201.jpg', 110),
  ('pasta', 'Beef Lasagna', 'Traditional Italian lasagna with beef bolognaise, béchamel sauce and cheeses', 54, 'https://forno-qa.site/imgPro/1747246625.jpg', 120),
  ('pasta', 'Fettuccine Alfredo', 'Fettuccine pasta, chicken, parmesan cheese, white sauce', 40, 'https://forno-qa.site/imgPro/1747246727.jpg', 130),
  ('pasta', 'Penne Arabiata', 'Spicy tomato sauce, fresh cherry tomatoes, fresh basil leaves, parmesan cheese', 35, 'https://forno-qa.site/imgPro/1747246971.jpg', 140),
  ('appetizer', 'Risotto Cheese Balls', '4 pieces crispy fried risotto balls stuffed with mozzarella cheese served with spicy marinara sauce.', 25, 'https://forno-qa.site/imgPro/1747248532.jpg', 10),
  ('appetizer', 'Grilled Shrimp', '6 pieces shrimp marinated with spicy sauce served with chili spicy sauce.', 30, 'https://forno-qa.site/imgPro/1747248610.jpg', 20),
  ('appetizer', 'Dynamite Shrimp', '6 pieces marinated with dynamite sauce', 35, 'https://forno-qa.site/imgPro/1770839726.jpg', 30),
  ('appetizer', 'Dynamite Chicken', 'Fried chicken cubes mixed with special Dynamite sauce', 31, 'https://forno-qa.site/imgPro/1783954708.jpg', 40),
  ('appetizer', 'Fried Shrimp', '6 pcs fried shrimp served with marinara spicy sauce', 30, 'https://forno-qa.site/imgPro/1747248926.jpg', 50),
  ('appetizer', 'Strips Chicken', '4 pcs fried chicken served with Forno sauce.', 25, 'https://forno-qa.site/imgPro/1747248975.jpg', 60),
  ('appetizer', 'Mozzarella Stick', '5 pieces of mozzarella stick served with Forno sauce', 28, 'https://forno-qa.site/imgPro/1747249092.jpg', 70),
  ('salads', 'Rocca Salad', 'Rocca, mushrooms, cherry tomatoes, parmesan cheese and balsamic glaze', 30, 'https://forno-qa.site/imgPro/1747249987.jpg', 10),
  ('salads', 'Caesar Salad', 'Your choice of plain or chicken caesar salad, iceberg lettuce, parmesan cheese, croutons, cherry tomatoes served with homemade caesar sauce.', 30, 'https://forno-qa.site/imgPro/1747250051.jpg', 20),
  ('main', 'Grilled Chicken With Mushroom Sauce', 'Chicken breast and mushroom sauce served with grilled veg or French fries', 60, 'https://forno-qa.site/imgPro/1747250200.jpg', 10),
  ('pizza', 'Ranch Chicken Pizza', 'Chicken, ranch sauce, mozzarella cheese, and mix capsicum.', 41, 'https://forno-qa.site/imgPro/1770839789.jpg', 10),
  ('pizza', 'Chicken Pizza', 'Fresh chicken marinated, Italian mix herbs sauce, mozzarella cheese, Italian dry herbs and Forno sauce', 40, 'https://forno-qa.site/imgPro/1770839817.jpg', 20),
  ('pizza', 'Dynamite Pizza', 'Beef bolognaise, mozzarella cheese, Italian red tomato sauce. Served with dynamite sauce', 49, 'https://forno-qa.site/imgPro/1770839841.jpg', 30),
  ('pizza', 'Pepperoni Pizza', 'Pizza with Italian mix herbs sauce, mozzarella cheese, pepperoni, Italian fresh herbs and Forno sauce.', 40, 'https://forno-qa.site/imgPro/1770839862.jpg', 40),
  ('pizza', 'Margherita Pizza', 'Mozzarella cheese, Italian fresh herbs, Italian mix herbs sauce and Forno sauce.', 35, 'https://forno-qa.site/imgPro/1770839905.jpg', 50),
  ('pizza', 'Diavola Pizza', 'Pepperoni, chicken, black olives, mixed colored capsicum, sliced onions, Italian fresh herbs, mozzarella cheese and Forno sauce.', 40, 'https://forno-qa.site/imgPro/1776805360.jpg', 60),
  ('pizza', 'Four Cheese Pizza', 'Mozzarella cheese, cheddar cheese, kashkaval cheese, parmesan cheese and Forno sauce.', 40, 'https://forno-qa.site/imgPro/1770839884.jpg', 70),
  ('pizza', 'Vegetables Pizza', 'Eggplant, sliced zucchini, sliced onions, sliced tomatoes, black olives, mushroom, mixed capsicum, mozzarella cheese, Italian herbs, Italian mix herb sauce and Forno sauce.', 37, 'https://forno-qa.site/imgPro/1747332580.jpg', 80),
  ('risotto', 'Risotto Seafood', 'Italian risotto, mixed seafood, mixed sauce and parmesan cheese.', 50, 'https://forno-qa.site/imgPro/1747247123.jpg', 10),
  ('risotto', 'Risotto Porcini', 'Italian risotto, porcini, mushrooms, cooking cream, cherry tomatoes and parmesan cheese.', 40, 'https://forno-qa.site/imgPro/1747247184.jpg', 20),
  ('risotto', 'Risotto Chicken', 'Italian risotto, parmesan cheese, mushroom, chicken.', 45, 'https://forno-qa.site/imgPro/1747247236.jpg', 30),
  ('sandwich', 'Melted Cheese Sandwich', 'Fresh mushroom, chicken, cooking cream with edamame cheese and Forno sauce.', 25, 'https://forno-qa.site/imgPro/1747247398.jpg', 10),
  ('burger', 'Forno Burger', 'Fresh beef patty, lettuce, mushroom, mixed capsicum, mushroom cooking cream, cheddar cheese and pickles.', 35, 'https://forno-qa.site/imgPro/1747247492.jpg', 10),
  ('burger', 'Chicken Crunchy Burger', 'Crispy fried chicken, sliced tomato, cucumber, pickle, cheddar cheese.', 30, 'https://forno-qa.site/imgPro/1747247626.jpg', 20),
  ('burger', 'Roma Burger', 'Fresh chicken patty, smoked turkey slices, lettuce, tomato, pickles, BBQ sauce and chef sauce.', 30, 'https://forno-qa.site/imgPro/1747247556.jpg', 30),
  ('burger', 'Spicy Chicken Burger', 'Chicken spicy patty, mushroom, lettuce, cheddar cheese, tomato, pickle.', 30, 'https://forno-qa.site/imgPro/1747247699.jpg', 40),
  ('side', 'Garlic Bread', '4 slice bread, mozzarella cheese, garlic butter', 20, 'https://forno-qa.site/imgPro/1747247789.jpg', 10),
  ('side', 'Dynamite Fries', 'Minced beef, cheese, French fries, special sauce', 30, 'https://forno-qa.site/imgPro/1776805174.jpg', 20),
  ('side', 'French Fries', 'French fries served with ketchup.', 12, 'https://forno-qa.site/imgPro/1776805274.jpg', 30),
  ('side', 'Cheese Fries', 'French fries and cheddar cheese.', 17, 'https://forno-qa.site/imgPro/1776805131.jpg', 40),
  ('side', 'Wedges Potato', 'Wedges potatoes served with ketchup sauce', 18, 'https://forno-qa.site/imgPro/1776805327.jpg', 50),
  ('juice', 'Lemon Mint Juice', 'Made with a blend of fresh lemons, mint, and a touch of sweetness, it’s a perfect thirst quencher and great to enjoy anytime of the day.', 18, 'https://forno-qa.site/imgPro/1747255286.jpg', 10),
  ('juice', 'Orange Juice', 'Made with freshly squeezed oranges, it’s a great source of Vitamin C.', 18, 'https://forno-qa.site/imgPro/1747255523.jpg', 20),
  ('juice', 'Pineapple Juice', 'Sweet, tropical drink made by blending the flesh of a pineapple. A rich source of vitamin C with enzymes that aid digestion.', 17, 'https://forno-qa.site/imgPro/1747255239.jpg', 30),
  ('juice', 'Strawberry Juice', 'Refreshing and delicious, rich in natural vitamins and minerals. Healthy alternative to sugary drinks.', 15, 'https://forno-qa.site/imgPro/1747255342.jpg', 40),
  ('juice', 'Mango Juice', 'Made from the freshest, ripest mangos, carefully selected for the perfect balance of sweetness and tanginess.', 15, 'https://forno-qa.site/imgPro/1747255383.jpg', 50),
  ('mojito', 'Strawberry Mojito', 'Made with fresh strawberries, mint leaves, lime juice and a splash of soda. A perfect balance of sweet and tangy.', 17, 'https://forno-qa.site/imgPro/1747255588.jpg', 10),
  ('mojito', 'Lemon Mint Mojito', 'Lemon, mint syrup mixed with seven up and blue lagoon', 17, 'https://forno-qa.site/imgPro/1747255651.jpg', 20),
  ('mojito', 'Passion Mojito', 'Fresh passion fruit, passion fruit syrup mixed with 7UP.', 20, 'https://forno-qa.site/imgPro/1747255706.jpg', 30),
  ('mojito', 'Forno Mojito', 'Our special fresh dragon fruit sauce mixed with 7UP.', 24, 'https://forno-qa.site/imgPro/1747255754.jpg', 40),
  ('shake', 'Strawberry Milkshake', 'Whipping cream, strawberry, ice cubes mixed with strawberry puree', 20, 'https://forno-qa.site/imgPro/1747308374.jpg', 10),
  ('soft', 'Kinza Cola', 'A crisp and revitalizing cola that quenches your thirst with its invigorating taste.', 5, 'https://forno-qa.site/imgPro/1747256304.jpg', 10),
  ('soft', 'Coca Cola', 'A crisp and revitalizing classic that quenches your thirst with its invigorating taste.', 6, 'https://forno-qa.site/imgPro/1747256571.jpg', 20),
  ('soft', 'Cola Light', 'A crisp, revitalizing light cola that quenches your thirst with its invigorating taste.', 6, 'https://forno-qa.site/imgPro/1747256611.jpg', 30),
  ('soft', 'Pepsi', 'A refreshing Pepsi that quenches your thirst with its rejuvenating essence.', 6, 'https://forno-qa.site/imgPro/1747256658.jpg', 40),
  ('soft', 'Diet Pepsi', 'A refreshing diet Pepsi that quenches your thirst with its invigorating taste.', 6, 'https://forno-qa.site/imgPro/1747256715.jpg', 50),
  ('soft', 'Dew', 'A crisp and revitalizing citrus soda that quenches your thirst.', 6, 'https://forno-qa.site/imgPro/1747256751.jpg', 60),
  ('soft', 'Kinza Diet', 'A crisp and revitalizing diet cola that quenches your thirst.', 5, 'https://forno-qa.site/imgPro/1747309781.jpg', 70),
  ('soft', 'Small Water', 'Stay hydrated and refreshed with our water.', 3, 'https://forno-qa.site/imgPro/1747256870.jpg', 80),
  ('dessert', 'Tiramisu Cake', 'A coffee-flavored Italian dessert. Ladyfingers soaked in coffee, layered with whipped eggs, sugar, mascarpone cheese and cocoa.', 28, 'https://forno-qa.site/imgPro/1770839757.jpg', 10),
  ('dessert', 'Lotus Cake', 'Lotus Biscoff, whipping cream mixed with cheese.', 19, 'https://forno-qa.site/imgPro/1770840353.jpg', 20),
  ('dessert', 'Cheesecake', 'Your choice of blueberry or strawberry cheesecake', 19, 'https://forno-qa.site/imgPro/1770839929.jpg', 30)
)
insert into public.menu_items (category_id, name_en, description_en, price, image_url, sort_order, is_available)
select c.id, s.name_en, s.description_en, s.price, s.image_url, s.sort_order, true
from src s
join public.categories c on c.slug = s.slug
where not exists (
  select 1 from public.menu_items m
  where m.category_id = c.id and m.name_en = s.name_en
);
