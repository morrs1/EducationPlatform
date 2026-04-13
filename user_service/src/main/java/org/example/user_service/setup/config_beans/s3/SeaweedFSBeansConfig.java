package org.example.user_service.setup.config_beans.s3;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

import java.net.URI;
import java.util.Objects;

@Configuration
public class SeaweedFSBeansConfig {


    @Bean
    public S3Client seaweedFSConnection(
            @Value("${temp.s3.region}") String region,
            @Value("${temp.s3.endpoint:}") String endpoint,
            @Value("${temp.s3.access-key:}") String accessKey,
            @Value("${temp.s3.secret-key:}") String secretKey,
            @Value("${temp.s3.path-style-access:false}") boolean pathStyleAccess
    ) {
        var builder = S3Client.builder()
                .region(Region.of(region))
                .serviceConfiguration(
                        S3Configuration.builder()
                                .pathStyleAccessEnabled(pathStyleAccess)
                                .build()
                );

        if (hasText(endpoint)) {
            builder.endpointOverride(URI.create(endpoint));
        }

        if (hasText(accessKey) && hasText(secretKey)) {
            var credentials = AwsBasicCredentials.builder()
                    .accessKeyId(accessKey)
                    .secretAccessKey(secretKey)
                    .build();
            builder.credentialsProvider(
                    StaticCredentialsProvider.create(credentials)
            );
        } else {
            builder.credentialsProvider(DefaultCredentialsProvider.builder().build());
        }

        return builder.build();
    }

    @Bean
    public SeaweedFSConnectionInfo seaweedFSConnectionInfo(
            @Value("${temp.s3.bucket}") String bucket,
            @Value("${temp.s3.public-base-url:}") String publicBaseUrl
    ) {
        return new SeaweedFSConnectionInfo(bucket, publicBaseUrl);
    }

    private boolean hasText(String value) {
        return Objects.nonNull(value) && !value.isBlank();
    }
}
