-- name: CreateSession :exec
INSERT INTO refresh_sessions (user_id, token_hash, expires_at)
VALUES ($1, $2, $3);

-- name: GetSessionByToken :one
SELECT * FROM refresh_sessions WHERE token_hash = $1;

-- name: RevokeSession :exec
UPDATE refresh_sessions SET revoked_at = now() WHERE id = $1;
