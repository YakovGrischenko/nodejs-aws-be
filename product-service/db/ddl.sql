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
	product_id uuid NOT NULL unique ,
	count integer,
	foreign key ("product_id") references "products" ("id")
);


