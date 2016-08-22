/* Creating user_details table */

create table user_details (name VARCHAR, email VARCHAR, role VARCHAR, secret_key varchar, password varchar, primary key (secret_key, email));