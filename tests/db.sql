DROP DATABASE IF EXISTS swanrest;
CREATE DATABASE swanrest;
USE swanrest;

CREATE TABLE people(
    name TEXT,
    job TEXT
);

INSERT INTO people(name,job) VALUES
("Mal", "Captain"),
("Zoe", "First Mate"),
("Jayne", "Public Relations"),
("Wash", "Pilot"),
("Kaylee", "Mechanic"),
("Inara", "Companion"),
("Book", "Shepherd"),
("Simon", "Doctor"),
("River", "Passenger");
