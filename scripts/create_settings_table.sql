CREATE TABLE IF NOT EXISTS settings (
  `key` VARCHAR(255) PRIMARY KEY,
  `value` TEXT
);

INSERT INTO settings (`key`, `value`) VALUES ('system_title', 'POSy') ON DUPLICATE KEY UPDATE `key`=`key`;
INSERT INTO settings (`key`, `value`) VALUES ('system_logo', '/PosyLogo.png') ON DUPLICATE KEY UPDATE `key`=`key`;
