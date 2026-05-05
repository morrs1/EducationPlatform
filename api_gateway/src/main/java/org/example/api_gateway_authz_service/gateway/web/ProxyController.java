package org.example.api_gateway_authz_service.gateway.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.api_gateway_authz_service.auth.JwtTokenService;
import org.example.api_gateway_authz_service.authz.AuthorizationPolicy;
import org.example.api_gateway_authz_service.gateway.proxy.ProxyForwardService;
import org.example.api_gateway_authz_service.gateway.routing.RouteResolver;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.InputStream;

@RestController
@RequestMapping(path = "${gateway.proxy.entry-path-prefix:/api}")
@Tag(name = "Gateway Proxy", description = "Protected proxy entrypoint for user, course and learning services")
public class ProxyController {

    private final RouteResolver routeResolver;
    private final ProxyForwardService proxyForwardService;
    private final JwtTokenService jwtTokenService;
    private final AuthorizationPolicy authorizationPolicy;

    public ProxyController(
            RouteResolver routeResolver,
            ProxyForwardService proxyForwardService,
            JwtTokenService jwtTokenService,
            AuthorizationPolicy authorizationPolicy) {
        this.routeResolver = routeResolver;
        this.proxyForwardService = proxyForwardService;
        this.jwtTokenService = jwtTokenService;
        this.authorizationPolicy = authorizationPolicy;
    }

    @RequestMapping(
            value = {"/", "/**"},
            method = {
                RequestMethod.GET,
                RequestMethod.POST,
                RequestMethod.PUT,
                RequestMethod.PATCH,
                RequestMethod.DELETE,
                RequestMethod.HEAD,
                RequestMethod.OPTIONS
            })
    @Operation(
            summary = "Proxy request to downstream services",
            description = "Requires Bearer JWT. Use `/api/user/**`, `/api/course/**` or `/api/learning/**`; gateway validates role policy before forwarding.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public void proxy(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String servletPath = request.getServletPath();
        String query = request.getQueryString();

        var match = routeResolver.resolve(servletPath, query);
        if (match.isEmpty()) {
            response.sendError(
                    HttpServletResponse.SC_NOT_FOUND,
                    "No gateway route for path: " + servletPath);
            return;
        }

        var principal = jwtTokenService.parseBearerToken(request.getHeader(HttpHeaders.AUTHORIZATION));
        byte[] body = readRequestBodyIfPresent(request);
        authorizationPolicy.authorize(
                HttpMethod.valueOf(request.getMethod()),
                servletPath,
                principal,
                match.get().targetUri(),
                body);

        proxyForwardService.forward(request, response, match.get(), body);
    }

    private static byte[] readRequestBodyIfPresent(HttpServletRequest request) throws IOException {
        int contentLength = request.getContentLength();
        try (InputStream in = request.getInputStream()) {
            if (contentLength < 0) {
                byte[] buf = in.readAllBytes();
                return buf.length == 0 ? null : buf;
            }
            if (contentLength == 0) {
                return null;
            }
            return in.readAllBytes();
        }
    }
}
