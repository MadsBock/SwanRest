DROP DATABASE IF EXISTS resttest;
CREATE DATABASE resttest;
USE resttest;

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
