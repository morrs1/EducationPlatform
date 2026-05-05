package org.example.api_gateway_authz_service.auth;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "auth.user-service")
public record UserServiceAuthProperties(String baseUri) {
}
