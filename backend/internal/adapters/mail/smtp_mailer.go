package mail

import (
	"context"
	"crypto/tls"
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
	_ = ctx // do not bind SMTP lifetime to HTTP request context

	if m.host == "" || m.port == 0 || m.from == "" {
		return fmt.Errorf("smtp is not configured")
	}
	if text == "" {
		text = html
	}

	msg := []byte(fmt.Sprintf(
		"From: %s\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n%s",
		m.from, to, subject, text,
	))
	addr := fmt.Sprintf("%s:%d", m.host, m.port)

	// Keep bounded deadline for SMTP operations even when caller provides no deadline.
	bgCtx, cancel := context.WithTimeout(context.Background(), 120*time.Second)
	defer cancel()

	dialer := &net.Dialer{
		Timeout:   60 * time.Second,
		KeepAlive: 15 * time.Second,
	}

	var auth smtp.Auth
	if m.user != "" && m.pass != "" {
		auth = smtp.PlainAuth("", m.user, m.pass, m.host)
	}

	var client *smtp.Client
	var conn net.Conn
	var err error

	if m.port == 465 {
		tlsConfig := &tls.Config{ServerName: m.host}
		conn, err = tls.DialWithDialer(dialer, "tcp", addr, tlsConfig)
		if err != nil {
			return fmt.Errorf("tls dial error: %w", err)
		}
		client, err = smtp.NewClient(conn, m.host)
		if err != nil {
			_ = conn.Close()
			return fmt.Errorf("smtp client error: %w", err)
		}
	} else {
		conn, err = dialer.DialContext(bgCtx, "tcp", addr)
		if err != nil {
			return fmt.Errorf("dial error: %w", err)
		}
		client, err = smtp.NewClient(conn, m.host)
		if err != nil {
			_ = conn.Close()
			return fmt.Errorf("smtp client error: %w", err)
		}
		if ok, _ := client.Extension("STARTTLS"); ok {
			tlsConfig := &tls.Config{ServerName: m.host}
			if err := client.StartTLS(tlsConfig); err != nil {
				_ = client.Close()
				return fmt.Errorf("starttls error: %w", err)
			}
		}
	}
	defer conn.Close()
	defer client.Close()

	_ = conn.SetDeadline(time.Now().Add(120 * time.Second))

	if auth != nil {
		if ok, _ := client.Extension("AUTH"); ok {
			if err = client.Auth(auth); err != nil {
				return fmt.Errorf("auth error: %w", err)
			}
		}
	}

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
