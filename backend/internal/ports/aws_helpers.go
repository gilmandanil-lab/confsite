package ports

import (
	"context"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
)

func StaticCredentials(accessKey, secretKey string) aws.CredentialsProvider {
	return credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")
}

type endpointResolver struct {
	endpoint string
}

func (e endpointResolver) ResolveEndpoint(service, region string, options ...interface{}) (aws.Endpoint, error) {
	return aws.Endpoint{
		URL:               e.endpoint,
		SigningRegion:     region,
		HostnameImmutable: true,
	}, nil
}

// AWS SDK expects EndpointResolverWithOptions in newer versions; this still works via adapter call.
func EndpointResolver(endpoint string) aws.EndpointResolverWithOptions {
	return aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return endpointResolver{endpoint: endpoint}.ResolveEndpoint(service, region, options...)
	})
}

var _ = context.Background
