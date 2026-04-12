package org.example.user_service.infrastructure.adapters.s3;

import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.util.Objects;
import java.util.UUID;

@Component
@ConditionalOnProperty(prefix = "temp.s3", name = "enabled", havingValue = "true")
public class TemporaryS3PhotoStorage {

    private final S3Client s3Client;
    private final String bucket;
    private final String publicBaseUrl;
    //TODO инкапсулировать логику создания подключения(и проброса энвов) в конфиг
    //TODO пробрасывать backet
    //TODO сделать так, чтобы при отсутсвии endpoint и access и secret key кидалась ошибка
    public TemporaryS3PhotoStorage(
            @Value("${temp.s3.region}") String region,
            @Value("${temp.s3.bucket}") String bucket,
            @Value("${temp.s3.endpoint:}") String endpoint,
            @Value("${temp.s3.access-key:}") String accessKey,
            @Value("${temp.s3.secret-key:}") String secretKey,
            @Value("${temp.s3.public-base-url:}") String publicBaseUrl,
            @Value("${temp.s3.path-style-access:false}") boolean pathStyleAccess
    ) {
        this.bucket = bucket;
        this.publicBaseUrl = publicBaseUrl;

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

        this.s3Client = builder.build();
    }

    public UploadedPhoto upload(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty");
        }

        var key = buildObjectKey(file.getOriginalFilename());

        try {
            var putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));
            return new UploadedPhoto(bucket, key, buildUrl(key));
        } catch (IOException exception) {
            throw new UncheckedIOException("Failed to read uploaded file", exception);
        }
    }

    private String buildObjectKey(String originalFilename) {
        return "tmp/photos/" + UUID.randomUUID() + "-" + sanitizeFilename(originalFilename);
    }

    private String buildUrl(String key) {
        if (hasText(publicBaseUrl)) {
            return publicBaseUrl.endsWith("/")
                    ? publicBaseUrl + key
                    : publicBaseUrl + "/" + key;
        }
        return "s3://" + bucket + "/" + key;
    }

    private String sanitizeFilename(String originalFilename) {
        if (!hasText(originalFilename)) {
            return "file";
        }
        return originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private boolean hasText(String value) {
        return Objects.nonNull(value) && !value.isBlank();
    }

    public record UploadedPhoto(
            String bucket,
            String key,
            String url
    ) {
    }

    @PreDestroy
    public void close() {
        s3Client.close();
    }
}
