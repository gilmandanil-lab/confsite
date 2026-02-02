-- +goose Up
ALTER TABLE talks ADD COLUMN file_url text;

-- +goose Down
ALTER TABLE talks DROP COLUMN file_url;
