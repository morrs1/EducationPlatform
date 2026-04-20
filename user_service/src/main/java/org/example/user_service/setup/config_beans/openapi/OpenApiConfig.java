package org.example.user_service.setup.config_beans.openapi;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "User Service API",
                version = "v1",
                description = "HTTP API for user management in EducationPlatform.",
                contact = @Contact(name = "EducationPlatform")
        ),
        servers = @Server(url = "/", description = "Current environment")
)
public class OpenApiConfig {
}
