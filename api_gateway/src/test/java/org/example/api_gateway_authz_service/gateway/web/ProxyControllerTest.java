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

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ProxyControllerTest {

    @Test
    void rejectsUnauthorizedRequestsBeforeForwarding() throws Exception {
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
        when(jwtTokenService.parseBearerToken(null))
                .thenThrow(new JwtAuthenticationException("Missing bearer token"));

        assertThrows(JwtAuthenticationException.class, () -> controller.proxy(request, response));

        verify(proxyForwardService, never())
                .forward(any(), any(), any(), any());
    }
}
