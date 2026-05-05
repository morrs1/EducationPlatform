package org.example.api_gateway_authz_service.auth;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

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
}
