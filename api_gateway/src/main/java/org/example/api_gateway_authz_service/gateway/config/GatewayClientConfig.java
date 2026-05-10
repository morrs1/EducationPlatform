package org.example.api_gateway_authz_service.gateway.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class GatewayClientConfig {

    @Bean
    public RestClient gatewayRestClient(RestClient.Builder restClientBuilder) {
        return restClientBuilder.build();
    }

    @Bean
    public ObjectMapper objectMapper() {
        return JsonMapper.builder()
                .findAndAddModules()
                .build();
    }
}
