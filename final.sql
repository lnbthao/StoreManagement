-- Bảng người dùng
CREATE TABLE `users` (
    `user_id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100),
    `role` ENUM('admin','staff') DEFAULT 'staff',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `is_active` BOOLEAN DEFAULT TRUE
);

-- Bảng khách hàng
CREATE TABLE `customers` (
    `customer_id` INT AUTO_INCREMENT PRIMARY KEY,
    `customer_name` varchar(100) NOT NULL,
    `phone` varchar(20) DEFAULT NULL,
    `email` varchar(100) DEFAULT NULL,
    `address` text,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `is_active` BOOLEAN DEFAULT TRUE
);

-- Bảng loại sản phẩm
CREATE TABLE `categories` (
    `category_id` INT AUTO_INCREMENT PRIMARY KEY,
    `category_name` VARCHAR(100) NOT NULL,
    `is_active` BOOLEAN DEFAULT TRUE
);

-- Bảng nhà cung cấp
CREATE TABLE suppliers (
    `supplier_id` INT AUTO_INCREMENT PRIMARY KEY,
    `supplier_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20),
    `email` VARCHAR(100),
    `address` TEXT,
    `is_active` BOOLEAN DEFAULT TRUE
);

-- Bảng sản phẩm
CREATE TABLE products (
    `product_id` INT AUTO_INCREMENT PRIMARY KEY,
    `category_id` INT,
    `supplier_id` INT,
    `product_name` VARCHAR(100) NOT NULL,
    `image_url` MEDIUMTEXT,
    `barcode` VARCHAR(50) UNIQUE,
    `price` DECIMAL(10,2) NOT NULL,
    `unit` VARCHAR(20) DEFAULT 'pcs',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `is_active` BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);

-- Bảng tồn kho
CREATE TABLE inventory (
    `inventory_id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_id` INT NOT NULL,
    `quantity` INT DEFAULT 0,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Bảng khuyến mãi
CREATE TABLE promotions (
    `promo_id` INT AUTO_INCREMENT PRIMARY KEY,
    `promo_code` VARCHAR(50) UNIQUE NOT NULL,
    `description` VARCHAR(255),
    `discount_type` ENUM('percent','fixed') NOT NULL,
    `discount_value` DECIMAL(10,2) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `min_order_amount` DECIMAL(10,2) DEFAULT 0,
    `usage_limit` INT DEFAULT 0,
    `used_count` INT DEFAULT 0,
    `status` ENUM('active', 'inactive') default 'active'
);

-- Bảng đơn hàng
CREATE TABLE `orders` (
    `order_id` INT AUTO_INCREMENT PRIMARY KEY,
    `customer_id` INT,
    `user_id` INT NOT NULL,
    `promo_id` INT,
    `order_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `status` ENUM('pending','paid','canceled') DEFAULT 'pending',
    `total_amount` DECIMAL(10,2) DEFAULT '0.00',
    `discount_amount` DECIMAL(10,2) DEFAULT '0.00',
    
    FOREIGN KEY (`customer_id`) REFERENCES customers(`customer_id`),
    FOREIGN KEY (`user_id`) REFERENCES users(`user_id`),
    FOREIGN KEY (`promo_id`) REFERENCES promotions(`promo_id`)
);

-- Bảng chi tiết đơn hàng
CREATE TABLE `order_items` (
    `order_item_id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `quantity` INT NOT NULL,
    `price` DECIMAL(10,2) NOT NULL,
    `subtotal` DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`),
    FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`)
);

-- Bảng thanh toán
CREATE TABLE `payments` (
    `payment_id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` int NOT NULL,
    `amount` decimal(10,2) NOT NULL,
    `payment_method` enum('cash','card','bank_transfer','e-wallet') DEFAULT 'cash',
    `payment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`)
);

-- DATA USERS
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'admin','$2a$11$vW9AFTYHjKXVd1O2Ob8GqucF6EcVPHjaD.Vl1e33p6SoZ0/i9cidC','Quản trị viên','admin','2025-10-31 10:19:59',1),
(2,'staff01','$2a$11$uwTYEcyB5VRzr/Xi0RiQoO3DEsQJEssbZ5CQuuLaKNlWrdJ3HxPK6','Nguyễn Văn A','staff','2025-10-31 10:19:59',1),
(3,'staff02','$2a$11$9t0Ak5M9uOKxg6nbnqNaeupM..5bW71KkNIe0zMF/Qa9K2M4q2K.a','Lê Thị Ba','staff','2025-10-31 10:19:59',1),
(4,'admin2','$2a$11$GHY4P5uPapevHaS4V5Iare5SHwPbQctjRa2KlSp8x4S301O1nhz7u','Michael Jackson','admin','2025-11-09 14:54:09',1),
(5,'staff03','$2a$11$NB2.29BQLiMhhYf1NhcFb.WslDM62PIP.lECMr/4dBeq272JmBL0K','Tran Van Ca','staff','2025-11-10 04:34:36',1),
(6,'staff04','$2a$11$OFvgA/c6UTSB0P2hraRPJuzQSW3gxNrlO63UvawOh.jL7h9vLztuC','Le Van D','staff','2025-11-10 05:20:43',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

-- DATA CUSTOMERS
INSERT INTO `customers` VALUES
(1,'Khách hàng 1','0909000001','kh1@mail.com','Địa chỉ 1','2025-10-31 10:19:59',1),
(2,'Khách hàng 2','0909000002','kh2@mail.com','Địa chỉ 2','2025-10-31 10:19:59',0),
(3,'Khách hàng 3','0909000003','kh3@mail.com','Địa chỉ 3','2025-10-31 10:19:59',1),
(4,'Khách hàng 4','0909000004','kh4@mail.com','Địa chỉ 4','2025-10-31 10:19:59',1),
(5,'Khách hàng 5','0909000005','kh5@mail.com','Địa chỉ 5','2025-10-31 10:19:59',1),
(6,'Khách hàng 6','0909000006','kh6@mail.com','Địa chỉ 6','2025-10-31 10:19:59',1),
(7,'Khách hàng 7','0909000007','kh7@mail.com','Địa chỉ 7','2025-10-31 10:19:59',1),
(8,'Khách hàng 8','0909000008','kh8@mail.com','Địa chỉ 8','2025-10-31 10:19:59',1),
(9,'Khách hàng 9','0909000009','kh9@mail.com','Địa chỉ 9','2025-10-31 10:19:59',1),
(10,'Khách hàng 10','0909000010','kh10@mail.com','Địa chỉ 10','2025-10-31 10:19:59',1),
(11,'Khách hàng 11','0909000011','kh11@mail.com','Địa chỉ 11','2025-10-31 10:19:59',1),
(12,'Khách hàng 12','0909000012','kh12@mail.com','Địa chỉ 12','2025-10-31 10:19:59',1),
(13,'Khách hàng 13','0909000013','kh13@mail.com','Địa chỉ 13','2025-10-31 10:19:59',1),
(14,'Khách hàng 14','0909000014','kh14@mail.com','Địa chỉ 14','2025-10-31 10:19:59',1),
(15,'Khách hàng 15','0909000015','kh15@mail.com','Địa chỉ 15','2025-10-31 10:19:59',1),
(16,'Khách hàng 16','0909000016','kh16@mail.com','Địa chỉ 16','2025-10-31 10:19:59',1),
(17,'Khách hàng 17','0909000017','kh17@mail.com','Địa chỉ 17','2025-10-31 10:19:59',1),
(18,'Khách hàng 18','0909000018','kh18@mail.com','Địa chỉ 18','2025-10-31 10:19:59',1),
(19,'Khách hàng 19','0909000019','kh19@mail.com','Địa chỉ 19','2025-10-31 10:19:59',1),
(20,'Khách hàng 20','0909000020','kh20@mail.com','Địa chỉ 20','2025-10-31 10:19:59',1);

-- DATA CATEGORIES
INSERT INTO categories (category_name) VALUES
('Đồ uống'),('Bánh kẹo'),('Gia vị'),('Đồ gia dụng'),('Mỹ phẩm'),('Mì, bún');

-- DATA SUPPLIERS
INSERT INTO suppliers (`supplier_name`, `phone`, `email`,`address`) VALUES
('Công ty ABC','0909123456','abc@gmail.com','Hà Nội'),
('Công ty XYZ','0912123456','xyz@gmail.com','TP HCM'),
('Công ty 123','0933123456','123@gmail.com','Đà Nẵng');

-- DATA PRODUCTS
LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES
(1,1,1,'Coca Cola lon','/images/products/1.png','8900000000001',314838.00,'lon','2025-10-31 10:19:59',1),
(2,1,3,'Pepsi lon','/images/products/2.png','8900000000002',114807.00,'lon','2025-10-31 10:19:59',1),
(3,1,3,'Trà Xanh 0 độ','/images/products/3.png','8900000000003',415725.00,'chai','2025-10-31 10:19:59',1),
(4,1,1,'Sting dâu','/images/products/4.png','8900000000004',351670.00,'lon','2025-10-31 10:19:59',1),
(5,1,2,'Red Bull','/images/products/5.png','8900000000005',402179.00,'lon','2025-10-31 10:19:59',1),
(6,2,2,'Bánh Oreo','/images/products/6.png','8900000000006',209283.00,'cái','2025-10-31 10:19:59',1),
(7,2,3,'Bánh Chocopie','/images/products/7.png','8900000000007',212528.00,'hộp','2025-10-31 10:19:59',1),
(8,2,2,'Kẹo Alpenliebe','/images/products/8.png','8900000000008',34313.00,'bịch','2025-10-31 10:19:59',1),
(9,2,1,'Kẹo bạc hà','/images/products/9.png','8900000000009',316289.00,'bịch','2025-10-31 10:19:59',1),
(10,2,2,'Socola KitKat','/images/products/10.png','8900000000010',139959.00,'cái','2025-10-31 10:19:59',1),
(11,3,1,'Nước mắm Nam Ngư','/images/products/11.png','8900000000011',51792.00,'chai','2025-10-31 10:19:59',1),
(12,3,2,'Nước tương Maggi','/images/products/12.png','8900000000012',462539.00,'chai','2025-10-31 10:19:59',1),
(13,3,3,'Muối i-ốt','/images/products/13.png','8900000000013',173302.00,'bịch','2025-10-31 10:19:59',1),
(14,3,1,'Bột ngọt Ajinomoto','/images/products/14.png','8900000000014',443069.00,'bịch','2025-10-31 10:19:59',1),
(15,3,2,'Dầu ăn Tường An','/images/products/15.png','8900000000015',281354.00,'chai','2025-10-31 10:19:59',1),
(16,4,1,'Nồi cơm điện','/images/products/16.png','8900000000016',405347.00,'cái','2025-10-31 10:19:59',1),
(17,4,3,'Ấm siêu tốc','/images/products/17.png','8900000000017',113087.00,'cái','2025-10-31 10:19:59',1),
(18,4,2,'Quạt máy','/images/products/18.png','8900000000018',69968.00,'cái','2025-10-31 10:19:59',1),
(19,4,1,'Bếp gas mini','/images/products/19.png','8900000000019',416845.00,'cái','2025-10-31 10:19:59',1),
(20,4,3,'Máy xay sinh tố','/images/products/20.png','8900000000020',334564.00,'cái','2025-10-31 10:19:59',1),
(21,5,1,'Sữa rửa mặt Hazeline','/images/products/21.png','8900000000021',188475.00,'tuýp','2025-10-31 10:19:59',1),
(22,5,1,"Kem dưỡng da Pond's",'/images/products/22.png','8900000000022',413840.00,'hộp','2025-10-31 10:19:59',1),
(23,5,3,'Dầu gội Sunsilk','/images/products/23.png','8900000000023',158950.00,'chai','2025-10-31 10:19:59',1),
(24,5,2,'Sữa tắm Dove','/images/products/24.png','8900000000024',336928.00,'chai','2025-10-31 10:19:59',1),
(25,5,1,'Nước hoa Romano','/images/products/25.png','8900000000025',352508.00,'chai','2025-10-31 10:19:59',1),
(26,1,1,'Cà phê G7','/images/products/26.png','8900000000026',201228.00,'hộp','2025-10-31 10:19:59',1),
(27,1,1,'Trà Lipton','/images/products/27.png','8900000000027',38039.00,'hộp','2025-10-31 10:19:59',1),
(28,1,3,'Sữa Vinamilk','/images/products/28.png','8900000000028',252845.00,'bịch','2025-10-31 10:19:59',1),
(29,1,1,'Sữa TH True Milk','/images/products/29.png','8900000000029',35278.00,'hộp','2025-10-31 10:19:59',1),
(30,1,2,'Nước suối Lavie','/images/products/30.png','8900000000030',331637.00,'chai','2025-10-31 10:19:59',1),
(31,5,3,'Khăn giấy Tempo','/images/products/31.png','8900000000031',102525.00,'cái','2025-10-31 10:19:59',1),
(32,5,3,'Giấy vệ sinh Pulppy','/images/products/32.png','8900000000032',495429.00,'cái','2025-10-31 10:19:59',1),
(33,4,2,'Bình nước Lock&Lock','/images/products/33.png','8900000000033',354771.00,'cái','2025-10-31 10:19:59',1),
(34,4,1,'Hộp nhựa Tupperware','/images/products/34.png','8900000000034',297415.00,'cái','2025-10-31 10:19:59',1),
(35,4,3,'Dao Inox','/images/products/35.png','8900000000035',47523.00,'cái','2025-10-31 10:19:59',1),
(36,5,1,'Bàn chải Colgate','/images/products/36.png','8900000000036',136417.00,'hộp','2025-10-31 10:19:59',1),
(37,5,2,'Kem đánh răng P/S','/images/products/37.png','8900000000037',93713.00,'hộp','2025-10-31 10:19:59',1),
(38,5,3,'Nước súc miệng Listerine','/images/products/38.png','8900000000038',223906.00,'chai','2025-10-31 10:19:59',1),
(39,5,2,'Bông tẩy trang','/images/products/39.png','8900000000039',317819.00,'bịch','2025-10-31 10:19:59',1),
(40,5,1,'Khẩu trang 3M','/images/products/40.png','8900000000040',464252.00,'hộp','2025-10-31 10:19:59',1),
(41,2,1,'Bánh mì sandwich','/images/products/41.png','8900000000041',279350.00,'bịch','2025-10-31 10:19:59',1),
(42,6,2,'Mì gói Hảo Hảo','/images/products/42.png','8900000000042',9413.00,'gói','2025-10-31 10:19:59',1),
(43,6,2,'Mì Omachi','/images/products/43.png','8900000000043',26616.00,'gói','2025-10-31 10:19:59',1),
(44,6,2,'Bún khô','/images/products/44.png','8900000000044',350911.00,'gói','2025-10-31 10:19:59',1),
(45,6,1,'Phở ăn liền','/images/products/45.png','8900000000045',407779.00,'gói','2025-10-31 10:19:59',1),
(46,1,1,'Nước ngọt Sprite','/images/products/46.png','8900000000046',230083.00,'lon','2025-10-31 10:19:59',1),
(47,1,3,'Trà sữa đóng chai','/images/products/47.png','8900000000047',15130.00,'chai','2025-10-31 10:19:59',1),
(48,2,3,'Snack Oishi','/images/products/48.png','8900000000048',43415.00,'bịch','2025-10-31 10:19:59',1),
(49,2,2,"Snack Lay's",'/images/products/49.png','8900000000049',83536.00,'bịch','2025-10-31 10:19:59',1),
(50,2,2,'Kẹo dẻo Haribo','/images/products/50.png','8900000000050',328680.00,'bịch','2025-10-31 10:19:59',1);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

-- DATA INVENTORY
INSERT INTO inventory (product_id,quantity) VALUES
(1, 25),(2, 169),(3, 77),(4, 169),(5, 90),(6, 105),(7, 125),(8, 37),(9, 74),(10, 149),
(11, 69),(12, 23),(13, 46),(14, 144),(15, 134),(16, 182),(17, 99),(18, 72),(19, 128),(20, 123),
(21, 155),(22, 78),(23, 166),(24, 117),(25, 168),(26, 197),(27, 36),(28, 145),(29, 61),(30, 139),
(31, 47),(32, 154),(33, 194),(34, 41),(35, 154),(36, 71),(37, 49),(38, 165),(39, 73),(40, 176),
(41, 41),(42, 34),(43, 175),(44, 59),(45, 198),(46, 106),(47, 99),(48, 55),(49, 62),(50, 33);

-- DATA PROMOTIONS
INSERT INTO promotions (`promo_code`, `description`, `discount_type`, `discount_value`, `start_date`, `end_date`, `min_order_amount`, `usage_limit`, `status`) VALUES
('SALE10', 'Giảm 10% cho mọi đơn hàng', 'percent', 10, '2025-01-01', '2025-12-31', 0, 0, "active"),
('FREESHIP50K', 'Giảm 50,000 cho đơn từ 300,000 trở lên', 'fixed', 50000, '2025-03-01', '2025-12-31', 300000, 500, "active"),
('NEWUSER', 'Giảm 20% cho khách hàng mới', 'percent', 20, '2025-01-01', '2025-06-30', 0, 1, "active"),
('SUMMER15', 'Giảm 15% mùa hè', 'percent', 15, '2025-06-01', '2025-08-31', 50000, 1000, "active"),
('VIP100K', 'Giảm 100,000 cho đơn từ 1 triệu', 'fixed', 100000, '2025-01-01', '2025-12-31', 1000000, 200, "active");

-- DATA ORDERS
INSERT INTO orders (customer_id,user_id,promo_id,status,total_amount,discount_amount) VALUES
(5, 3, 5, 'paid', 1292330, 100000),(17, 3, NULL, 'paid', 1731608, 0),(8, 3, NULL, 'paid', 720782, 0),(20, 3, 5, 'paid', 21686, 21686),(1, 2, NULL, 'paid', 94180, 0),(5, 3, 2, 'paid', 3888671, 100000),(9, 3, 4, 'paid', 512594, 102518.8),(11, 3, 3, 'paid', 1715029, 171502.90000000002),(11, 3, NULL, 'paid', 2484051, 0),(11, 3, 2, 'paid', 1070239, 100000),(20, 3, NULL, 'paid', 1532741, 0),(10, 2, NULL, 'paid', 1785354, 0),(10, 3, 2, 'paid', 1588276, 100000),(6, 2, 2, 'paid', 2896096, 50000),(10, 2, 3, 'paid', 186000, 27900.0),(10, 2, 5, 'paid', 1024090, 50000),(19, 3, NULL, 'paid', 467148, 0),(10, 2, NULL, 'paid', 394342, 0),(8, 3, 4, 'paid', 1965637, 294845.55),(3, 3, NULL, 'paid', 2889813, 0),(9, 2, NULL, 'paid', 2288406, 0),(17, 3, NULL, 'paid', 331008, 0),(6, 3, 1, 'paid', 2154851, 323227.64999999997),(1, 3, 1, 'paid', 1138686, 170802.9),(2, 2, 5, 'paid', 393847, 100000),(15, 3, 1, 'paid', 260658, 52131.600000000006),(4, 2, NULL, 'paid', 933199, 0),(16, 2, NULL, 'paid', 2609123, 0),(4, 3, 4, 'paid', 2406292, 481258.4),(1, 3, NULL, 'paid', 2912134, 0);

-- DATA ORDER_ITEMS
INSERT INTO order_items (order_id,product_id,quantity,price,subtotal) VALUES
(1, 23, 2, 31265, 62530),(1, 5, 2, 205683, 411366),(1, 47, 1, 477948, 477948),(1, 25, 2, 170243, 340486),(2, 39, 1, 447059, 447059),(2, 14, 1, 51108, 51108),(2, 46, 3, 411147, 1233441),(3, 18, 3, 202167, 606501),(3, 34, 1, 44219, 44219),(3, 26, 3, 23354, 70062),(4, 24, 2, 10843, 21686),(5, 9, 1, 94180, 94180),(6, 18, 3, 186886, 560658),(6, 22, 2, 199267, 398534),(6, 42, 3, 215726, 647178),(6, 17, 3, 474268, 1422804),(6, 20, 3, 286499, 859497),(7, 8, 2, 256297, 512594),(8, 42, 1, 355116, 355116),(8, 43, 2, 129224, 258448),(8, 31, 3, 367155, 1101465),(9, 17, 2, 48755, 97510),(9, 12, 2, 381904, 763808),(9, 43, 2, 167445, 334890),(9, 19, 3, 429281, 1287843),(10, 25, 1, 232635, 232635),(10, 1, 2, 245362, 490724),(10, 23, 2, 127233, 254466),(10, 49, 2, 46207, 92414),(11, 3, 2, 347879, 695758),(11, 23, 3, 130215, 390645),(11, 4, 1, 64761, 64761),(11, 33, 1, 240159, 240159),(11, 7, 1, 141418, 141418),(12, 40, 2, 455428, 910856),(12, 46, 2, 75412, 150824),(12, 34, 2, 189856, 379712),(12, 25, 3, 114654, 343962),(13, 24, 2, 143251, 286502),(13, 23, 2, 381347, 762694),(13, 18, 2, 179146, 358292),(13, 9, 2, 90394, 180788),(14, 24, 2, 327016, 654032),(14, 2, 1, 403478, 403478),(14, 27, 3, 404474, 1213422),(14, 4, 2, 312582, 625164),(15, 18, 1, 105328, 105328),(15, 27, 2, 17303, 34606),(15, 50, 2, 23033, 46066),(16, 15, 1, 43160, 43160),(16, 16, 2, 18541, 37082),(16, 44, 1, 492698, 492698),(16, 41, 1, 451150, 451150),(17, 42, 1, 467148, 467148),(18, 30, 1, 64334, 64334),(18, 11, 1, 178454, 178454),(18, 20, 3, 50518, 151554),(19, 16, 1, 89280, 89280),(19, 23, 3, 404655, 1213965),(19, 11, 2, 331196, 662392),(20, 49, 1, 367325, 367325),(20, 32, 2, 264392, 528784),(20, 19, 3, 345903, 1037709),(20, 17, 2, 392028, 784056),(20, 19, 1, 171939, 171939),(21, 11, 3, 227666, 682998),(21, 25, 2, 436122, 872244),(21, 48, 1, 340400, 340400),(21, 10, 2, 58482, 116964),(21, 4, 2, 137900, 275800),(22, 40, 2, 165504, 331008),(23, 1, 2, 296698, 593396),(23, 16, 3, 384657, 1153971),(23, 40, 3, 135828, 407484),(24, 3, 3, 379562, 1138686),(25, 9, 1, 22063, 22063),(25, 16, 2, 185892, 371784),(26, 47, 2, 130329, 260658),(27, 37, 1, 448581, 448581),(27, 23, 1, 484618, 484618),(28, 20, 3, 357837, 1073511),(28, 34, 1, 161219, 161219),(28, 1, 3, 458131, 1374393),(29, 28, 1, 485514, 485514),(29, 7, 3, 487044, 1461132),(29, 42, 1, 235885, 235885),(29, 38, 1, 223761, 223761),(30, 25, 1, 426943, 426943),(30, 11, 3, 130209, 390627),(30, 5, 2, 73116, 146232),(30, 46, 2, 272220, 544440),(30, 23, 3, 467964, 1403892);

-- DATA PAYMENTS
INSERT INTO payments (order_id,amount,payment_method) VALUES
(1, 1192330, 'cash'),(2, 1731608, 'e-wallet'),(3, 720782, 'e-wallet'),(4, 0, 'card'),(5, 94180, 'cash'),(6, 3788671, 'cash'),(7, 410075.2, 'e-wallet'),(8, 1543526.1, 'cash'),(9, 2484051, 'cash'),(10, 970239, 'card'),(11, 1532741, 'e-wallet'),(12, 1785354, 'card'),(13, 1488276, 'card'),(14, 2846096, 'cash'),(15, 158100.0, 'card'),(16, 974090, 'cash'),(17, 467148, 'cash'),(18, 394342, 'e-wallet'),(19, 1670791.45, 'card'),(20, 2889813, 'card'),(21, 2288406, 'cash'),(22, 331008, 'e-wallet'),(23, 1831623.35, 'cash'),(24, 967883.1, 'e-wallet'),(25, 293847, 'cash'),(26, 208526.4, 'cash'),(27, 933199, 'cash'),(28, 2609123, 'card'),(29, 1925033.6, 'cash'),(30, 2912134, 'card');