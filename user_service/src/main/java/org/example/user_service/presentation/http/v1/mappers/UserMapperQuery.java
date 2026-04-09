package org.example.user_service.presentation.http.v1.mappers;

import org.example.user_service.application.interactors.read_user_by_id.ReadUserByIdQuery;
import org.example.user_service.application.interactors.read_user_by_id.ReadUserByIdView;
import org.example.user_service.presentation.http.v1.user.read_by_id.dto.ReadUserByIdRequest;
import org.example.user_service.presentation.http.v1.user.read_by_id.dto.ReadUserByIdResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapperQuery {

    ReadUserByIdQuery toReadUserByIdQuery(ReadUserByIdRequest readUserByIdRequest);

    ReadUserByIdResponse toReadUserByIdResponse(ReadUserByIdView readUserByIdView);
}
