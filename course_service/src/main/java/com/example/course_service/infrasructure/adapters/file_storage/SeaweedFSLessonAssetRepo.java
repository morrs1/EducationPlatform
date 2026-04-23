package com.example.course_service.infrasructure.adapters.file_storage;

import com.example.course_service.application.interactors.asset.add_asset_to_lesson.AddAssetCommand;
import com.example.course_service.application.interactors.asset.add_asset_to_lesson.AddAssetView;
import com.example.course_service.application.ports.AssetFileStorage;
import com.example.course_service.setup.config_beans.s3.SeaweedFSBeansConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.util.Objects;
import java.util.UUID;

@Component
@ConditionalOnProperty(prefix = "temp.s3", name = "enabled", havingValue = "true")
@RequiredArgsConstructor
public class SeaweedFSLessonAssetRepo implements AssetFileStorage {

    private final S3Client s3Client;
    private final SeaweedFSBeansConfig.SeaweedFSConnectionInfo connectionInfo;

    @Override
    public AddAssetView add(AddAssetCommand file) {
        var key = buildObjectKey(file.originalFileName());

        var putObjectRequest = PutObjectRequest.builder()
                .bucket(connectionInfo.bucket())
                .key(key)
                .contentType(file.mimeType())
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.content()));
        return new AddAssetView(key, buildUrl(key));
    }

    private String buildObjectKey(String originalFilename) {
        return "lessons_assets/" + UUID.randomUUID() + "-" + sanitizeFilename(originalFilename);
    }

    private String buildUrl(String key) {
        var publicBaseUrl = connectionInfo.publicBaseUrl();
        if (hasText(publicBaseUrl)) {
            return publicBaseUrl.endsWith("/")
                    ? publicBaseUrl + key
                    : publicBaseUrl + "/" + key;
        }
        return "s3://" + connectionInfo.bucket() + "/" + key;
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
}
