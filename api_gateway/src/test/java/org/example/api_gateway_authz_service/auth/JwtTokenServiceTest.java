package org.example.api_gateway_authz_service.auth;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.api_gateway_authz_service.authz.AuthenticatedPrincipal;
import org.example.api_gateway_authz_service.authz.UserRole;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtTokenServiceTest {

    @Test
    void createsJwtWithUserClaims() throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        JwtTokenService jwtTokenService = new JwtTokenService(
                objectMapper,
                new JwtProperties("test-secret-for-local-dev", Duration.ofMinutes(15))
        );
        UUID userId = UUID.randomUUID();

        String token = jwtTokenService.createToken(
                new AuthenticatedUser(userId, "user@example.com", "USER", "STUDENT")
        );

        String[] parts = token.split("\\.");
        Map<String, Object> payload = objectMapper.readValue(
                Base64.getUrlDecoder().decode(parts[1]),
                new TypeReference<>() {
                }
        );
        assertEquals(userId.toString(), payload.get("sub"));
        assertEquals("user@example.com", payload.get("email"));
        assertEquals("USER", payload.get("role"));
        assertEquals("STUDENT", payload.get("userStatus"));
    }

    @Test
    void parsesValidBearerToken() {
        ObjectMapper objectMapper = new ObjectMapper();
        JwtTokenService jwtTokenService = new JwtTokenService(
                objectMapper,
                new JwtProperties("test-secret-for-local-dev", Duration.ofMinutes(15))
        );
        UUID userId = UUID.randomUUID();
        String token = jwtTokenService.createToken(
                new AuthenticatedUser(userId, "author@example.com", "AUTHOR", "ACTIVE")
        );

        AuthenticatedPrincipal principal = jwtTokenService.parseBearerToken("Bearer " + token);

        assertEquals(userId, principal.id());
        assertEquals("author@example.com", principal.email());
        assertEquals(UserRole.AUTHOR, principal.role());
        assertEquals("ACTIVE", principal.userStatus());
    }

    @Test
    void rejectsTokenWithInvalidSignature() {
        ObjectMapper objectMapper = new ObjectMapper();
        JwtTokenService jwtTokenService = new JwtTokenService(
                objectMapper,
                new JwtProperties("test-secret-for-local-dev", Duration.ofMinutes(15))
        );
        UUID userId = UUID.randomUUID();
        String token = jwtTokenService.createToken(
                new AuthenticatedUser(userId, "user@example.com", "USER", "ACTIVE")
        );
        String tamperedToken = token.substring(0, token.length() - 2) + "xx";

        assertThrows(
                JwtAuthenticationException.class,
                () -> jwtTokenService.parseBearerToken("Bearer " + tamperedToken)
        );
    }

    @Test
    void rejectsExpiredToken() {
        ObjectMapper objectMapper = new ObjectMapper();
        JwtTokenService jwtTokenService = new JwtTokenService(
                objectMapper,
                new JwtProperties("test-secret-for-local-dev", Duration.ofSeconds(-1))
        );
        UUID userId = UUID.randomUUID();
        String token = jwtTokenService.createToken(
                new AuthenticatedUser(userId, "user@example.com", "USER", "ACTIVE")
        );

        assertThrows(
                JwtAuthenticationException.class,
                () -> jwtTokenService.parseBearerToken("Bearer " + token)
        );
    }
}
