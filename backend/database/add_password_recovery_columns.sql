-- Run once on an existing Costodian database to enable recovery for accounts created before this feature.
USE foodcost_db;

ALTER TABLE users
    ADD COLUMN recovery_question VARCHAR(32) DEFAULT NULL,
    ADD COLUMN recovery_answer VARCHAR(255) DEFAULT NULL;
