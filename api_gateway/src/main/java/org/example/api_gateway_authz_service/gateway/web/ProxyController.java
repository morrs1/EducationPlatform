package org.example.api_gateway_authz_service.gateway.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.api_gateway_authz_service.gateway.proxy.ProxyForwardService;
import org.example.api_gateway_authz_service.gateway.routing.RouteResolver;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping(path = "${gateway.proxy.entry-path-prefix:/api}")
public class ProxyController {

    private final RouteResolver routeResolver;
    private final ProxyForwardService proxyForwardService;

    public ProxyController(RouteResolver routeResolver, ProxyForwardService proxyForwardService) {
        this.routeResolver = routeResolver;
        this.proxyForwardService = proxyForwardService;
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

        proxyForwardService.forward(request, response, match.get());
    }
}
