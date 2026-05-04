package org.example.api_gateway_authz_service.gateway.proxy;

import org.springframework.http.HttpHeaders;

import java.util.Locale;
import java.util.Set;

public final class HopByHopHeaders {

    private static final Set<String> NAMES = Set.of(
            "connection",
            "keep-alive",
            "proxy-authenticate",
            "proxy-authorization",
            "te",
            "trailer",
            "transfer-encoding",
            "upgrade");

    private HopByHopHeaders() {
    }

    public static boolean isHopByHop(String headerName) {
        return NAMES.contains(headerName.toLowerCase(Locale.ROOT));
    }

    /** Удалить hop-by-hop из набор заголовков (для копирования в upstream). */
    public static HttpHeaders copyWithoutHopByHop(HttpHeaders source) {
        HttpHeaders headers = new HttpHeaders();
        source.forEach(
                (name, values) -> {
                    if (!isHopByHop(name)) {
                        headers.addAll(name, values);
                    }
                });
        headers.remove(HttpHeaders.HOST);
        return headers;
    }
}
