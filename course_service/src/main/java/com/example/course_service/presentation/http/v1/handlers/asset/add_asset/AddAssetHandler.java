package com.example.course_service.presentation.http.v1.handlers.asset.add_asset;

import com.example.course_service.application.interactors.asset.add_asset_to_lesson.AddAssetCommand;
import com.example.course_service.application.interactors.asset.add_asset_to_lesson.AddAssetInteractor;
import com.example.course_service.application.interactors.asset.add_asset_to_lesson.AddAssetView;
import com.example.course_service.domain.base.exceptions.ValidateException;
import com.example.course_service.presentation.http.v1.exceptions.AssetContentReadException;
import com.example.course_service.presentation.http.v1.exceptions.EmptyFileException;
import com.example.course_service.presentation.http.v1.handlers.course.read_by_id.AddAssetRequest;
import com.example.course_service.presentation.http.v1.exceptions_handlers.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Encoding;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/course/lesson")
@RequiredArgsConstructor
@Tag(name = "Lesson Assets", description = "Upload lesson asset files and store their metadata")
public class AddAssetHandler {

    private static final Map<String, Set<String>> ALLOWED_EXTENSIONS_BY_ASSET_TYPE = Map.of(
            "image", Set.of("jpg", "jpeg", "png", "webp"),
            "cover", Set.of("jpg", "jpeg", "png", "webp"),
            "video", Set.of("mp4", "webm", "mov", "avi", "mkv"),
            "file", Set.of("pdf", "txt", "doc", "docx", "zip", "rar")
    );

    private final AddAssetInteractor interactor;

    @Operation(
            summary = "Add asset to lesson",
            description = "Accepts a multipart request with a binary file part and a JSON metadata part named `request`."
    )
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            description = "Multipart body containing the file itself and additional asset metadata.",
            content = @Content(
                    mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                    schema = @Schema(implementation = AddAssetMultipartBody.class),
                    encoding = {
                            @Encoding(name = "file", contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE),
                            @Encoding(name = "request", contentType = MediaType.APPLICATION_JSON_VALUE)
                    }
            )
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Asset uploaded successfully"),
            @ApiResponse(
                    responseCode = "404",
                    description = "Lesson not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "422",
                    description = "Validation error or empty file",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    @PostMapping(value = "/{id}/asset", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AddAssetResponse add(
            @Parameter(description = "Lesson identifier", required = true)
            @PathVariable("id") UUID lessonId,
            @RequestPart("file") MultipartFile file,
            @RequestPart("request") AddAssetRequest request
    ) {
        validateFile(file, request.assetType());
        if (!isExtensionValid(file, request.assetType())) throw new ValidateException("Unsupported file extension");
        AddAssetView addAssetView;
        try {
            addAssetView = interactor.add(
                    new AddAssetCommand(
                            lessonId,
                            request.title(),
                            file.getOriginalFilename(),
                            request.assetType(),
                            file.getContentType(),
                            file.getSize(),
                            file.getBytes()
                    )
            );
        } catch (IOException ex) {
            throw new AssetContentReadException("Failed to read uploaded file content");
        }


        return new AddAssetResponse(
                addAssetView.key(),
                addAssetView.url()
        );
    }

    private void validateFile(MultipartFile file, String assetType) {
        if (file == null || file.isEmpty()) {
            throw new EmptyFileException("File must not be empty");
        }
        if (!StringUtils.hasText(assetType)) {
            throw new ValidateException("Asset type must not be blank");
        }
    }

    private boolean isExtensionValid(MultipartFile file, String assetType) {
        String originalFilename = file.getOriginalFilename();
        String extension = StringUtils.getFilenameExtension(originalFilename);

        if (extension == null) {
            throw new ValidateException("File extension is missing");
        }

        extension = extension.toLowerCase();
        Set<String> allowedExtensions = ALLOWED_EXTENSIONS_BY_ASSET_TYPE.get(assetType);
        if (allowedExtensions == null) {
            throw new ValidateException("Unsupported asset type");
        }

        return allowedExtensions.contains(extension);

    }

    @Schema(name = "AddAssetMultipartBody", description = "Multipart payload for lesson asset upload")
    private static final class AddAssetMultipartBody {
        @Schema(
                description = "Binary file content",
                type = "string",
                format = "binary",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        public MultipartFile file;

        @Schema(
                description = "Asset metadata JSON part",
                implementation = AddAssetRequest.class,
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        public AddAssetRequest request;
    }
}
