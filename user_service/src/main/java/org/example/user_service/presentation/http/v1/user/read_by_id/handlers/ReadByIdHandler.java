package org.example.user_service.presentation.http.v1.user.read_by_id.handlers;

import lombok.RequiredArgsConstructor;
import org.example.user_service.application.interactors.read_user_by_id.ReadUserByIdInteractor;
import org.example.user_service.presentation.http.v1.user.mappers.UserMapperQuery;
import org.example.user_service.presentation.http.v1.user.read_by_id.dto.ReadUserByIdRequest;
import org.example.user_service.presentation.http.v1.user.read_by_id.dto.ReadUserByIdResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class ReadByIdHandler {

    private final ReadUserByIdInteractor readUserByIdInteractor;
    private final UserMapperQuery mapper;

    //TODO разобраться с маппингом id
    @GetMapping()
    public ReadUserByIdResponse readUserById(@RequestParam("id") UUID id) {
        return mapper.toReadUserByIdResponse(readUserByIdInteractor.readUserById(mapper.toReadUserByIdQuery(new ReadUserByIdRequest(id))));
    }
}
