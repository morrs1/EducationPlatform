package org.example.user_service.presentation.http.v1.user.read_by_id.handlers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.user_service.application.interactors.user.read_user_by_id.ReadUserByIdInteractor;
import org.example.user_service.presentation.http.v1.mappers.UserMapperQuery;
import org.example.user_service.presentation.http.v1.user.read_by_id.dto.ReadUserByIdResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
@Tag(name = "Users", description = "Operations for user management")
public class ReadByIdHandler {

    private final ReadUserByIdInteractor readUserByIdInteractor;
    private final UserMapperQuery mapper;

    @GetMapping()
    @Operation(summary = "Get user by id", description = "Returns full user data by identifier.")
    public ReadUserByIdResponse readById(@RequestParam("id") UUID id) {
        return mapper.toReadUserByIdResponse(readUserByIdInteractor.readById(id));
    }
}
