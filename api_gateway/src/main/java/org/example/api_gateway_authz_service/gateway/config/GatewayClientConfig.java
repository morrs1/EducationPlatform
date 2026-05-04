package org.example.api_gateway_authz_service.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class GatewayClientConfig {

    @Bean
    public RestClient gatewayRestClient(RestClient.Builder restClientBuilder) {
        return restClientBuilder.build();
    }
}
