package org.example.user_service.presentation.http.v1.temp;

import lombok.RequiredArgsConstructor;
import org.example.user_service.infrastructure.adapters.s3.TemporaryS3PhotoStorage;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/temp/s3")
@ConditionalOnBean(TemporaryS3PhotoStorage.class)
public class TempS3UploadHandler {

    private final TemporaryS3PhotoStorage storage;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public TempS3UploadResponse upload(@RequestPart("file") MultipartFile file) {
        var uploadedPhoto = storage.upload(file);
        return new TempS3UploadResponse(
                uploadedPhoto.bucket(),
                uploadedPhoto.key(),
                uploadedPhoto.url(),
                file.getOriginalFilename(),
                file.getContentType(),
                file.getSize()
        );
    }

    public record TempS3UploadResponse(
            String bucket,
            String key,
            String url,
            String originalFilename,
            String contentType,
            long size
    ) {
    }
}
