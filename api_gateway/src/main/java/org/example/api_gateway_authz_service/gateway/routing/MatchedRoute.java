package org.example.api_gateway_authz_service.gateway.routing;

import org.example.api_gateway_authz_service.gateway.config.GatewayProperties;

import java.net.URI;

public record MatchedRoute(GatewayProperties.RouteDefinition definition, URI targetUri) {
}
