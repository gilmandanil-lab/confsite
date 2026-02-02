-- name: InsertAudit :exec
INSERT INTO audit_logs (actor_user_id, action, entity, entity_id)
VALUES ($1,$2,$3,$4);

-- name: ListAudit :many
SELECT * FROM audit_logs ORDER BY created_at DESC;
