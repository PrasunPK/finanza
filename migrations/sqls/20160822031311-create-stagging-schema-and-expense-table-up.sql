/* Replace with your SQL commands */

CREATE SCHEMA stagging;
CREATE TABLE stagging.expenses (year VARCHAR(5), month VARCHAR(11), day varchar(11), purpose VARCHAR(20), category VARCHAR(20), amount numeric(10), updated_at VARCHAR(20), updated_by VARCHAR(50));