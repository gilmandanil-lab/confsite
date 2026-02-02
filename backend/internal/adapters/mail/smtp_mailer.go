package mail

import (
	"crypto/tls"
	"context"
	"fmt"
	"net"
	"net/smtp"
	"time"

	"confsite/backend/internal/ports"
)

type SMTPMailer struct {
	host string
	port int
	from string
	user string
	pass string
}

func NewSMTPMailer(host string, port int, from, user, pass string) ports.Mailer {
	return &SMTPMailer{host, port, from, user, pass}
}

func (m *SMTPMailer) Send(ctx context.Context, to, subject, html, text string) error {
	msg := []byte(fmt.Sprintf(
		"From: %s\r\nTo: %s\r\nSubject: %s\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n%s",
		m.from, to, subject, text,
	))
	addr := fmt.Sprintf("%s:%d", m.host, m.port)
	auth := smtp.PlainAuth("", m.user, m.pass, m.host)

	// Ignore incoming context - use background with generous timeout for async email sending
	// This is necessary because the incoming context may have short deadlines
	bgCtx, cancel := context.WithTimeout(context.Background(), 120*time.Second)
	defer cancel()

	// Create a custom dialer with generous timeout for SMTP operations
	// DNS resolution + TCP dial + TLS handshake can take time
	dialer := &net.Dialer{
		Timeout:   60 * time.Second,
		KeepAlive: 15 * time.Second,
		DualStack: true,
	}

	// Create TLS connection for secure SMTP (port 465)
	tlsConfig := &tls.Config{
		ServerName: m.host,
	}

	// Perform dial in the background context
	dialDone := make(chan error, 1)
	var conn net.Conn
	go func() {
		var err error
		conn, err = tls.DialWithDialer(dialer, "tcp", addr, tlsConfig)
		dialDone <- err
	}()

	select {
	case err := <-dialDone:
		if err != nil {
			return fmt.Errorf("tls dial error: %w", err)
		}
	case <-bgCtx.Done():
		return fmt.Errorf("dial context deadline exceeded: %w", bgCtx.Err())
	}

	defer conn.Close()

	// Create SMTP client
	client, err := smtp.NewClient(conn, m.host)
	if err != nil {
		return fmt.Errorf("smtp client error: %w", err)
	}
	defer client.Close()

	// Set deadline on the connection
	conn.SetDeadline(time.Now().Add(120 * time.Second))

	// Authenticate
	if err = client.Auth(auth); err != nil {
		return fmt.Errorf("auth error: %w", err)
	}

	// Send email
	if err = client.Mail(m.from); err != nil {
		return fmt.Errorf("mail error: %w", err)
	}
	if err = client.Rcpt(to); err != nil {
		return fmt.Errorf("rcpt error: %w", err)
	}
	w, err := client.Data()
	if err != nil {
		return fmt.Errorf("data error: %w", err)
	}
	_, err = w.Write(msg)
	if err != nil {
		return fmt.Errorf("write error: %w", err)
	}
	if err = w.Close(); err != nil {
		return fmt.Errorf("close error: %w", err)
	}

	return client.Quit()
}
