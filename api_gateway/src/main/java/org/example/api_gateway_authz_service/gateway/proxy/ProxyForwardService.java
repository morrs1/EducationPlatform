package org.example.api_gateway_authz_service.gateway.proxy;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.api_gateway_authz_service.gateway.routing.MatchedRoute;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;

@Service
public class ProxyForwardService {

    private static final Logger log = LoggerFactory.getLogger(ProxyForwardService.class);

    private final RestClient restClient;

    public ProxyForwardService(RestClient restClient) {
        this.restClient = restClient;
    }

    public void forward(HttpServletRequest request, HttpServletResponse response, MatchedRoute matched)
            throws IOException {

        HttpMethod method = HttpMethod.valueOf(request.getMethod());
        HttpHeaders outgoing = buildOutgoingRequestHeaders(request);
        byte[] body = readRequestBodyIfPresent(request);
        forward(request, response, matched, body, method, outgoing);
    }

    public void forward(
            HttpServletRequest request,
            HttpServletResponse response,
            MatchedRoute matched,
            byte[] body)
            throws IOException {

        HttpMethod method = HttpMethod.valueOf(request.getMethod());
        HttpHeaders outgoing = buildOutgoingRequestHeaders(request);
        forward(request, response, matched, body, method, outgoing);
    }

    private void forward(
            HttpServletRequest request,
            HttpServletResponse response,
            MatchedRoute matched,
            byte[] body,
            HttpMethod method,
            HttpHeaders outgoing)
            throws IOException {

        URI target = matched.targetUri();

        try {
            RestClient.ResponseSpec retrieveSpec =
                    buildRetrieveSpec(restClient, method, target, outgoing, body);

            ResponseEntity<byte[]> entity = retrieveSpec.toEntity(byte[].class);
            writeResponse(response, entity.getStatusCode().value(), entity.getHeaders(), entity.getBody());
        } catch (RestClientResponseException ex) {
            writeResponse(
                    response,
                    ex.getStatusCode().value(),
                    ex.getResponseHeaders(),
                    ex.getResponseBodyAsByteArray());
        } catch (ResourceAccessException ex) {
            log.warn("Upstream unreachable: {}", target, ex);
            response.sendError(HttpServletResponse.SC_BAD_GATEWAY, "Bad gateway");
        }
    }

    private static RestClient.ResponseSpec buildRetrieveSpec(
            RestClient restClient,
            HttpMethod method,
            URI target,
            HttpHeaders outgoing,
            byte[] body) {

        var req = restClient.method(method).uri(target).headers(h -> h.addAll(outgoing));
        if (body != null && body.length > 0) {
            return req.body(body).retrieve();
        }
        return req.retrieve();
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

    private static HttpHeaders buildOutgoingRequestHeaders(HttpServletRequest request) {
        HttpHeaders headers = new HttpHeaders();
        java.util.Enumeration<String> names = request.getHeaderNames();
        while (names.hasMoreElements()) {
            String name = names.nextElement();
            if (HopByHopHeaders.isHopByHop(name)) {
                continue;
            }
            if ("host".equalsIgnoreCase(name)) {
                continue;
            }
            java.util.Enumeration<String> values = request.getHeaders(name);
            while (values.hasMoreElements()) {
                headers.add(name, values.nextElement());
            }
        }
        headers.remove(HttpHeaders.CONTENT_LENGTH);
        headers.remove(HttpHeaders.TRANSFER_ENCODING);
        return headers;
    }

    private static void writeResponse(
            HttpServletResponse response, int status, HttpHeaders responseHeaders, byte[] body)
            throws IOException {

        response.setStatus(status);

        if (responseHeaders != null) {
            HttpHeaders sanitized = HopByHopHeaders.copyWithoutHopByHop(responseHeaders);
            sanitized.forEach(
                    (name, values) -> {
                        boolean first = true;
                        for (String v : values) {
                            if (first) {
                                response.setHeader(name, v);
                                first = false;
                            } else {
                                response.addHeader(name, v);
                            }
                        }
                    });
        }

        if (body == null || body.length == 0) {
            return;
        }

        try (OutputStream out = response.getOutputStream()) {
            out.write(body);
        }
    }
}
