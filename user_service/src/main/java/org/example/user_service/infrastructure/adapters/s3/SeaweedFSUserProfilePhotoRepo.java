package org.example.user_service.infrastructure.adapters.s3;

import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import org.example.user_service.application.interactors.user.add_profile_photo.AddProfilePhotoCommand;
import org.example.user_service.application.interactors.user.add_profile_photo.AddProfilePhotoView;
import org.example.user_service.application.ports.PhotoStorage;
import org.example.user_service.setup.config_beans.s3.SeaweedFSConnection;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.Objects;
import java.util.UUID;

@Component
@ConditionalOnProperty(prefix = "temp.s3", name = "enabled", havingValue = "true")
@RequiredArgsConstructor
public class SeaweedFSUserProfilePhotoRepo implements PhotoStorage {

    private final SeaweedFSConnection seaweedFSConnection;

    //TODO сделать так, чтобы при отсутсвии endpoint и access и secret key кидалась ошибка
    //TODO посмотреть, что можно сделать с предупреждением над s3
    public AddProfilePhotoView add(AddProfilePhotoCommand file) {
//        if (file.isEmpty()) {
//            throw new IllegalArgumentException("File must not be empty");
//        }

        var key = buildObjectKey(file.originalFileName());

        var putObjectRequest = PutObjectRequest.builder()
                .bucket(seaweedFSConnection.bucket())
                .key(key)
                .contentType(file.contentType())
                .build();

        seaweedFSConnection.s3Client().putObject(putObjectRequest, RequestBody.fromBytes(file.content()));
        return new AddProfilePhotoView(seaweedFSConnection.bucket(), key, buildUrl(key));
    }

    private String buildObjectKey(String originalFilename) {
        return "user_photos/" + UUID.randomUUID() + "-" + sanitizeFilename(originalFilename);
    }

    private String buildUrl(String key) {
        var publicBaseUrl = seaweedFSConnection.publicBaseUrl();
        if (hasText(publicBaseUrl)) {
            return publicBaseUrl.endsWith("/")
                    ? publicBaseUrl + key
                    : publicBaseUrl + "/" + key;
        }
        return "s3://" + seaweedFSConnection.bucket() + "/" + key;
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

    @PreDestroy
    public void close() {
        seaweedFSConnection.s3Client().close();
    }
}
