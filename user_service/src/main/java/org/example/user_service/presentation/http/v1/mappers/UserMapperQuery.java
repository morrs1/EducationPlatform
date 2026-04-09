package org.example.user_service.presentation.http.v1.mappers;

import org.example.user_service.application.interactors.read_user_by_id.ReadUserByIdView;
import org.example.user_service.presentation.http.v1.user.read_by_id.dto.ReadUserByIdResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapperQuery {
    ReadUserByIdResponse toReadUserByIdResponse(ReadUserByIdView readUserByIdView);
}
