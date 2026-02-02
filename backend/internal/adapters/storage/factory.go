package storage

import (
	"context"

	"confsite/backend/internal/ports"

	"github.com/aws/aws-sdk-go-v2/config"
	s3sdk "github.com/aws/aws-sdk-go-v2/service/s3"
)

type S3Config struct {
	Endpoint      string
	Region        string
	Bucket        string
	AccessKey     string
	SecretKey     string
	PublicBaseURL string
	UsePathStyle  bool
}

func NewLocal(baseDir, publicBaseURL string) ports.Storage {
	return Local{BaseDir: baseDir, PublicBaseURL: publicBaseURL}
}

func NewS3(cfg S3Config) ports.Storage {
	awsCfg, _ := config.LoadDefaultConfig(context.Background(),
		config.WithRegion(cfg.Region),
		config.WithCredentialsProvider(ports.StaticCredentials(cfg.AccessKey, cfg.SecretKey)),
		config.WithEndpointResolverWithOptions(ports.EndpointResolver(cfg.Endpoint)),
	)

	client := s3sdk.NewFromConfig(awsCfg, func(o *s3sdk.Options) {
		o.UsePathStyle = cfg.UsePathStyle
	})

	return S3{
		Client:        client,
		Bucket:        cfg.Bucket,
		PublicBaseURL: cfg.PublicBaseURL,
	}
}
