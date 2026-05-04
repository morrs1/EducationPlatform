package org.example.api_gateway_authz_service.gateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

@ConfigurationProperties(prefix = "gateway")
public class GatewayProperties {

    private final Proxy proxy = new Proxy();

    /** Список правил прокси. Пересечения разрешаются по самому длинному path-prefix. */
    private List<RouteDefinition> routes = new ArrayList<>();

    public Proxy getProxy() {
        return proxy;
    }

    public List<RouteDefinition> getRoutes() {
        return routes;
    }

    public void setRoutes(List<RouteDefinition> routes) {
        this.routes = routes != null ? routes : new ArrayList<>();
    }

    public static class Proxy {

        /** Весь трафик прокси обрабатывается под этим префиксом (контроллер + матчинг маршрутов). */
        private String entryPathPrefix = "/api";

        public String getEntryPathPrefix() {
            return entryPathPrefix;
        }

        public void setEntryPathPrefix(String entryPathPrefix) {
            this.entryPathPrefix =
                    normalizePrefix(entryPathPrefix != null ? entryPathPrefix.trim() : "/api");
        }
    }

    public static class RouteDefinition {

        private String id;

        /** Входной путь (от корня приложения после context-path), должен совпасть как prefix, напр. /api/learning. */
        private String pathPrefix;

        /** База upstream без завершающего слеша, напр. http://localhost:8081 */
        private String targetBaseUri;

        /**
         * Что вырезать с начала пути перед приклеиванием к target-base-uri.
         * По умолчанию равно path-prefix.
         */
        private String stripPrefix;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getPathPrefix() {
            return pathPrefix;
        }

        public void setPathPrefix(String pathPrefix) {
            this.pathPrefix = pathPrefix != null ? normalizePrefix(pathPrefix) : null;
        }

        public String getTargetBaseUri() {
            return targetBaseUri;
        }

        public void setTargetBaseUri(String targetBaseUri) {
            this.targetBaseUri =
                    targetBaseUri != null ? targetBaseUri.replaceAll("/+$", "") : null;
        }

        public String getStripPrefix() {
            return stripPrefix;
        }

        public void setStripPrefix(String stripPrefix) {
            this.stripPrefix =
                    stripPrefix != null ? normalizePrefix(stripPrefix) : null;
        }

        public URI toTargetUri() {
            return URI.create(targetBaseUri);
        }

        public String getEffectiveStripPrefix() {
            if (stripPrefix != null && !stripPrefix.isEmpty()) {
                return stripPrefix;
            }
            return pathPrefix != null ? pathPrefix : "";
        }
    }

    private static String normalizePrefix(String path) {
        if (path == null || path.isEmpty()) {
            return "";
        }
        String p = path.startsWith("/") ? path : "/" + path;
        if ("/".equals(p)) {
            return "/";
        }
        return p.endsWith("/") ? p.substring(0, p.length() - 1) : p;
    }
}
