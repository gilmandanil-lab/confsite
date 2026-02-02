-- +goose Up
ALTER TABLE talks ADD COLUMN schedule_time timestamptz;

-- +goose Down
ALTER TABLE talks DROP COLUMN schedule_time;
