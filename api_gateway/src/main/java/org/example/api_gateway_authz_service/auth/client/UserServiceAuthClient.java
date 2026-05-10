package org.example.api_gateway_authz_service.auth.client;

import org.example.api_gateway_authz_service.auth.AuthenticatedUser;
import org.example.api_gateway_authz_service.auth.UserServiceAuthProperties;
import org.example.api_gateway_authz_service.auth.dto.RegisterRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class UserServiceAuthClient {

    private final RestClient restClient;
    private final UserServiceAuthProperties properties;

    public UserServiceAuthClient(RestClient restClient, UserServiceAuthProperties properties) {
        this.restClient = restClient;
        this.properties = properties;
    }

    public UserServiceRegisterResponse register(RegisterRequest request) {
        return restClient.post()
                .uri(properties.baseUri() + "/user/auth/register")
                .body(new UserServiceRegisterRequest(
                        request.surname(),
                        request.name(),
                        request.patronymic(),
                        request.userStatus(),
                        request.email(),
                        request.password(),
                        request.profilePhotoLink()
                ))
                .retrieve()
                .body(UserServiceRegisterResponse.class);
    }

    public AuthenticatedUser login(String email, String password) {
        return restClient.post()
                .uri(properties.baseUri() + "/user/auth/login")
                .body(new UserServiceLoginRequest(email, password))
                .retrieve()
                .body(AuthenticatedUser.class);
    }
}
