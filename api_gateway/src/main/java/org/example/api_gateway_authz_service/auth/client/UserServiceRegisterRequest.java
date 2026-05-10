package org.example.api_gateway_authz_service.auth.client;

record UserServiceRegisterRequest(
        String surname,
        String name,
        String patronymic,
        String userStatus,
        String userEmail,
        String userPassword,
        String userProfilePhotoLink
) {
}
