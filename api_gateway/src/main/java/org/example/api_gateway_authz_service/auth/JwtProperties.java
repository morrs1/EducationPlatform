package org.example.api_gateway_authz_service.auth;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "auth.jwt")
public record JwtProperties(
        String secret,
        Duration ttl
) {
    public JwtProperties {
        if (ttl == null) {
            ttl = Duration.ofMinutes(15);
        }
    }
}
