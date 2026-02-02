-- +goose Up
ALTER TABLE profiles
DROP COLUMN consent_accepted,
ADD COLUMN consent_data_processing boolean NOT NULL DEFAULT false,
ADD COLUMN consent_data_transfer boolean NOT NULL DEFAULT false;

-- +goose Down
ALTER TABLE profiles
DROP COLUMN consent_data_processing,
DROP COLUMN consent_data_transfer,
ADD COLUMN consent_accepted boolean NOT NULL DEFAULT false;
