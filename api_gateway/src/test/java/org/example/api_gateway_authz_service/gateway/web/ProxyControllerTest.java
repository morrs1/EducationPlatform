package org.example.api_gateway_authz_service.gateway.web;

import org.example.api_gateway_authz_service.auth.JwtAuthenticationException;
import org.example.api_gateway_authz_service.auth.JwtTokenService;
import org.example.api_gateway_authz_service.authz.AuthorizationPolicy;
import org.example.api_gateway_authz_service.gateway.proxy.ProxyForwardService;
import org.example.api_gateway_authz_service.gateway.routing.MatchedRoute;
import org.example.api_gateway_authz_service.gateway.routing.RouteResolver;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.net.URI;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ProxyControllerTest {

    @Test
    void allowsPublicCourseListWithoutJwt() throws Exception {
        RouteResolver routeResolver = mock(RouteResolver.class);
        ProxyForwardService proxyForwardService = mock(ProxyForwardService.class);
        JwtTokenService jwtTokenService = mock(JwtTokenService.class);
        AuthorizationPolicy authorizationPolicy = mock(AuthorizationPolicy.class);
        ProxyController controller = new ProxyController(
                routeResolver,
                proxyForwardService,
                jwtTokenService,
                authorizationPolicy
        );
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/course");
        request.setServletPath("/api/course");
        MockHttpServletResponse response = new MockHttpServletResponse();
        when(routeResolver.resolve("/api/course", null))
                .thenReturn(Optional.of(new MatchedRoute(null, URI.create("http://localhost:8081/course"))));

        controller.proxy(request, response);

        verify(jwtTokenService, never()).parseBearerToken(any());
        verify(authorizationPolicy, never()).authorize(any(), any(), any(), any(), any());
        verify(proxyForwardService).forward(eq(request), eq(response), any(), any());
    }

    @Test
    void rejectsDraftsWithoutJwtBeforeForwarding() throws Exception {
        RouteResolver routeResolver = mock(RouteResolver.class);
        ProxyForwardService proxyForwardService = mock(ProxyForwardService.class);
        JwtTokenService jwtTokenService = mock(JwtTokenService.class);
        AuthorizationPolicy authorizationPolicy = mock(AuthorizationPolicy.class);
        ProxyController controller = new ProxyController(
                routeResolver,
                proxyForwardService,
                jwtTokenService,
                authorizationPolicy
        );
        String authorId = UUID.randomUUID().toString();
        String path = "/api/course/by-author/" + authorId + "/drafts";
        MockHttpServletRequest request = new MockHttpServletRequest("GET", path);
        request.setServletPath(path);
        MockHttpServletResponse response = new MockHttpServletResponse();
        when(routeResolver.resolve(path, null))
                .thenReturn(Optional.of(new MatchedRoute(null, URI.create("http://localhost:8081/course/by-author/" + authorId + "/drafts"))));
        when(jwtTokenService.parseBearerToken(null))
                .thenThrow(new JwtAuthenticationException("Missing bearer token"));

        assertThrows(JwtAuthenticationException.class, () -> controller.proxy(request, response));

        verify(proxyForwardService, never()).forward(any(), any(), any(), any());
    }
}
