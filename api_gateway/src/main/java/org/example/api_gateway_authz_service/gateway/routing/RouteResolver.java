package org.example.api_gateway_authz_service.gateway.routing;

import org.example.api_gateway_authz_service.gateway.config.GatewayProperties;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Component
public class RouteResolver {

    private final GatewayProperties gatewayProperties;

    public RouteResolver(GatewayProperties gatewayProperties) {
        this.gatewayProperties = gatewayProperties;
    }

    /** servlet path начинается с entry prefix; ищем маршрут по суффиксу целикому пути после нормализации. */
    public Optional<MatchedRoute> resolve(String servletPath, String rawQueryString) {
        String path =
                servletPath.startsWith("/") ? servletPath : "/" + servletPath;
        List<GatewayProperties.RouteDefinition> defs = new ArrayList<>(gatewayProperties.getRoutes());
        defs.sort(
                Comparator.comparingInt((GatewayProperties.RouteDefinition d) ->
                                safeLen(d.getPathPrefix()))
                        .reversed()
                        .thenComparing(
                                route -> Objects.toString(route.getId(), ""),
                                Comparator.naturalOrder()));

        for (GatewayProperties.RouteDefinition route : defs) {
            String prefix = route.getPathPrefix();
            if (prefix == null || prefix.isEmpty()) {
                continue;
            }
            if (path.equals(prefix) || path.startsWith(prefix + "/")) {
                String remainder = remainderAfterStrip(path, prefix, route.getEffectiveStripPrefix());
                URI base = route.toTargetUri();
                String query = rawQueryString != null && !rawQueryString.isEmpty()
                        ? "?" + rawQueryString
                        : "";
                URI target = URI.create(base.toString().replaceFirst("/+$", "") + remainder + query);
                return Optional.of(new MatchedRoute(route, target));
            }
        }
        return Optional.empty();
    }

    private static int safeLen(String s) {
        return s == null ? 0 : s.length();
    }

    /**
     * Путь на upstream: после strip — всегда начинается с {@code /}, не бывает пустой строки.
     */
    private static String remainderAfterStrip(String path, String prefix, String strip) {
        String remainder =
                path.startsWith(strip)
                        ? (path.length() == strip.length()
                                ? "/"
                                : path.substring(strip.length()))
                        : path.substring(prefix.length());
        if (!remainder.startsWith("/")) {
            remainder = "/" + remainder;
        }
        return remainder;
    }
}
