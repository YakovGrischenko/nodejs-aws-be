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
('33a36bf5-a146-406c-8655-e8977d8e0ab4', 'product2', 3),
('33a36bf5-a146-406c-8655-e8977d8e0ab5', 'product3', 4);


insert into stocks (product_id, count) values 
('33a36bf5-a146-406c-8655-e8977d8e0ab4', 21),
('33a36bf5-a146-406c-8655-e8977d8e0ab5', 22);
