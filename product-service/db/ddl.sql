create EXTENSION if not EXISTS "uuid-ossp";


DROP TABLE IF exists products CASCADE; 

create table products (
	id uuid primary key default uuid_generate_v4(),
	title text NOT NULL,
	description text,
	price integer
);

DROP TABLE IF exists stocks;

create table stocks (
	product_id uuid unique,
	count integer,
	foreign key ("product_id") references "products" ("id")
);

insert into products (id, title, price) values
('33a36bf5-a146-406c-8655-e8977d8e0ab4', 'Счастье для всех даром v 2.0', 0),
('33a36bf5-a146-406c-8655-e8977d8e0ab5', 'Товар с такой же картинкой', 99);


insert into stocks (product_id, count) values 
('33a36bf5-a146-406c-8655-e8977d8e0ab4', 7000000),
('33a36bf5-a146-406c-8655-e8977d8e0ab5', 42);
