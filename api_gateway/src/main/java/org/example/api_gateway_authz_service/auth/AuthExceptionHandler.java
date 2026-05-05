package org.example.api_gateway_authz_service.auth;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.RestClientResponseException;

@RestControllerAdvice
public class AuthExceptionHandler {

    @ExceptionHandler(RestClientResponseException.class)
    public ResponseEntity<String> handleDownstream(RestClientResponseException exception) {
        HttpHeaders headers = new HttpHeaders();
        if (exception.getResponseHeaders() != null
                && exception.getResponseHeaders().getContentType() != null) {
            headers.setContentType(exception.getResponseHeaders().getContentType());
        }
        return ResponseEntity
                .status(exception.getStatusCode())
                .headers(headers)
                .body(exception.getResponseBodyAsString());
    }
}
