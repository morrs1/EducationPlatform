package org.example.user_service.infrastructure.adapters.s3;

import lombok.RequiredArgsConstructor;
import org.example.user_service.application.interactors.user.add_profile_photo.AddProfilePhotoCommand;
import org.example.user_service.application.interactors.user.add_profile_photo.AddProfilePhotoView;
import org.example.user_service.application.ports.PhotoStorage;
import org.example.user_service.setup.config_beans.s3.SeaweedFSConnectionInfo;
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
public class SeaweedFSUserProfilePhotoRepo implements PhotoStorage {

    private final S3Client s3Client;
    private final SeaweedFSConnectionInfo seaweedFSConnectionInfo;

    public AddProfilePhotoView add(AddProfilePhotoCommand file) {
        var key = buildObjectKey(file.originalFileName());

        var putObjectRequest = PutObjectRequest.builder()
                .bucket(seaweedFSConnectionInfo.bucket())
                .key(key)
                .contentType(file.contentType())
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.content()));
        return new AddProfilePhotoView(seaweedFSConnectionInfo.bucket(), key, buildUrl(key));
    }

    private String buildObjectKey(String originalFilename) {
        return "user_photos/" + UUID.randomUUID() + "-" + sanitizeFilename(originalFilename);
    }

    private String buildUrl(String key) {
        var publicBaseUrl = seaweedFSConnectionInfo.publicBaseUrl();
        if (hasText(publicBaseUrl)) {
            return publicBaseUrl.endsWith("/")
                    ? publicBaseUrl + key
                    : publicBaseUrl + "/" + key;
        }
        return "s3://" + seaweedFSConnectionInfo.bucket() + "/" + key;
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
