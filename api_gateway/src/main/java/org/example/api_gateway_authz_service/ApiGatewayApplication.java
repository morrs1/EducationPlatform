package org.example.api_gateway_authz_service;

import org.example.api_gateway_authz_service.auth.JwtProperties;
import org.example.api_gateway_authz_service.auth.UserServiceAuthProperties;
import org.example.api_gateway_authz_service.gateway.config.GatewayProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({
        GatewayProperties.class,
        JwtProperties.class,
        UserServiceAuthProperties.class
})
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }

}
