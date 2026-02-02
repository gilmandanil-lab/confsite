-- name: CreateUser :one
INSERT INTO users (email, password_hash, status)
VALUES ($1, $2, 'WAITING')
RETURNING id;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1;

-- name: GetUserByID :one
SELECT * FROM users WHERE id = $1;

-- name: UpdateUserStatus :exec
UPDATE users SET status = $2 WHERE id = $1;
