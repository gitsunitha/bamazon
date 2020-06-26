DROP DATABASE IF EXISTS bamazon;
CREATE database bamazon;
USE bamazon;


CREATE TABLE `departments` (
  `department_id` int NOT NULL AUTO_INCREMENT,
  `department_name` varchar(256) NOT NULL,
  `over_head_costs` int DEFAULT NULL,
  PRIMARY KEY (`department_id`)
) AUTO_INCREMENT=5 
;


CREATE TABLE `products` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `item_name` varchar(256) NOT NULL,
  `department_id` int DEFAULT NULL,
  `price` float DEFAULT '0',
  `inventory` int DEFAULT '0',
  `product_sales` float DEFAULT '0',
  `fulfillment_days` int DEFAULT '0',
  PRIMARY KEY (`item_id`),
  KEY `idx_products_department_id_item_id` (`department_id`,`item_id`),
  CONSTRAINT `department_id` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`)
)  AUTO_INCREMENT=11 ;



