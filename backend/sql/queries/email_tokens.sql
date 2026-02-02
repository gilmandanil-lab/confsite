-- name: CreateEmailToken :exec
INSERT INTO email_verify_tokens (user_id, token_hash, expires_at)
VALUES ($1, $2, $3);

-- name: GetEmailTokenByHash :one
SELECT * FROM email_verify_tokens WHERE token_hash = $1;

-- name: MarkEmailTokenUsed :exec
UPDATE email_verify_tokens SET used_at = now() WHERE id = $1;
