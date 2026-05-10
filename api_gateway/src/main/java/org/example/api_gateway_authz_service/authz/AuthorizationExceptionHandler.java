package org.example.api_gateway_authz_service.authz;

import org.example.api_gateway_authz_service.auth.JwtAuthenticationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class AuthorizationExceptionHandler {

    @ExceptionHandler(JwtAuthenticationException.class)
    public ResponseEntity<String> handleAuthentication(JwtAuthenticationException exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(exception.getMessage());
    }

    @ExceptionHandler(AuthorizationDeniedException.class)
    public ResponseEntity<String> handleAuthorization(AuthorizationDeniedException exception) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(exception.getMessage());
    }
}
