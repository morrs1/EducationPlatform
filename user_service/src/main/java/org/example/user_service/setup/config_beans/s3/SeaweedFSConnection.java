package org.example.user_service.setup.config_beans.s3;

import software.amazon.awssdk.services.s3.S3Client;

public record SeaweedFSConnection(S3Client s3Client, String bucket, String publicBaseUrl) {
}
