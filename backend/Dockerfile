FROM golang:1.23-alpine AS build

WORKDIR /app

RUN apk add --no-cache git build-base

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/api ./cmd/api

FROM alpine:3.20
WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata postgresql-client wget

COPY --from=build /bin/api /app/api
COPY migrations /app/migrations
COPY templates /app/templates
COPY entrypoint.sh /app/entrypoint.sh

# Install goose for migrations
RUN wget -q https://github.com/pressly/goose/releases/download/v3.15.1/goose_linux_x86_64 -O /usr/local/bin/goose && \
    chmod +x /usr/local/bin/goose && \
    chmod +x /app/entrypoint.sh

ENV GIN_MODE=release
EXPOSE 8084

CMD ["/app/entrypoint.sh"]
