package org.example.api_gateway_authz_service.auth;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.api_gateway_authz_service.authz.AuthenticatedPrincipal;
import org.example.api_gateway_authz_service.authz.UserRole;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class JwtTokenService {

    private static final Base64.Encoder BASE64_URL = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder BASE64_URL_DECODER = Base64.getUrlDecoder();

    private final ObjectMapper objectMapper;
    private final JwtProperties jwtProperties;

    public JwtTokenService(ObjectMapper objectMapper, JwtProperties jwtProperties) {
        this.objectMapper = objectMapper;
        this.jwtProperties = jwtProperties;
    }

    public String createToken(AuthenticatedUser user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(jwtProperties.ttl());

        Map<String, Object> header = new LinkedHashMap<>();
        header.put("alg", "HS256");
        header.put("typ", "JWT");

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sub", user.id().toString());
        payload.put("email", user.email());
        payload.put("role", user.role());
        payload.put("userStatus", user.userStatus());
        payload.put("iat", now.getEpochSecond());
        payload.put("exp", expiresAt.getEpochSecond());

        String unsigned = base64Json(header) + "." + base64Json(payload);
        return unsigned + "." + sign(unsigned);
    }

    public long expiresInSeconds() {
        return jwtProperties.ttl().toSeconds();
    }

    public AuthenticatedPrincipal parseBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new JwtAuthenticationException("Missing bearer token");
        }

        String token = authorizationHeader.substring("Bearer ".length()).trim();
        String[] parts = token.split("\\.");
        if (parts.length != 3 || parts[0].isBlank() || parts[1].isBlank() || parts[2].isBlank()) {
            throw new JwtAuthenticationException("Invalid JWT format");
        }

        String unsignedToken = parts[0] + "." + parts[1];
        String expectedSignature = sign(unsignedToken);
        if (!MessageDigest.isEqual(
                expectedSignature.getBytes(StandardCharsets.UTF_8),
                parts[2].getBytes(StandardCharsets.UTF_8))) {
            throw new JwtAuthenticationException("Invalid JWT signature");
        }

        Map<String, Object> claims = readPayload(parts[1]);
        assertNotExpired(claims);
        try {
            return new AuthenticatedPrincipal(
                    UUID.fromString(requireStringClaim(claims, "sub")),
                    requireStringClaim(claims, "email"),
                    UserRole.valueOf(requireStringClaim(claims, "role")),
                    requireStringClaim(claims, "userStatus")
            );
        } catch (IllegalArgumentException ex) {
            throw new JwtAuthenticationException("Invalid JWT claims", ex);
        }
    }

    private String base64Json(Map<String, Object> value) {
        try {
            return BASE64_URL.encodeToString(objectMapper.writeValueAsBytes(value));
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Failed to serialize JWT claims", ex);
        }
    }

    private String sign(String unsignedToken) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(jwtProperties.secret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return BASE64_URL.encodeToString(mac.doFinal(unsignedToken.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to sign JWT", ex);
        }
    }

    private Map<String, Object> readPayload(String encodedPayload) {
        try {
            return objectMapper.readValue(
                    BASE64_URL_DECODER.decode(encodedPayload),
                    new TypeReference<>() {
                    }
            );
        } catch (Exception ex) {
            throw new JwtAuthenticationException("Invalid JWT payload", ex);
        }
    }

    private static void assertNotExpired(Map<String, Object> claims) {
        Object exp = claims.get("exp");
        if (!(exp instanceof Number expNumber)) {
            throw new JwtAuthenticationException("Missing JWT expiration");
        }
        if (Instant.now().getEpochSecond() >= expNumber.longValue()) {
            throw new JwtAuthenticationException("Expired JWT");
        }
    }

    private static String requireStringClaim(Map<String, Object> claims, String claimName) {
        Object value = claims.get(claimName);
        if (!(value instanceof String stringValue) || stringValue.isBlank()) {
            throw new JwtAuthenticationException("Missing JWT claim: " + claimName);
        }
        return stringValue;
    }
}
