package com.freemarket.freemarket.global.swagger;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@OpenAPIDefinition(
        info = @io.swagger.v3.oas.annotations.info.Info(
                title = "FreeMarket API",
                description = "FreeMarket 프로젝트 API 문서",
                version = "v1.0.0",
                contact = @Contact(
                        name = "FreeMarket",
                        email = "rlaxogjs202014030@gmail.com",
                        url = "http://localhost:8080"
                )
        ),
        servers = {
                @io.swagger.v3.oas.annotations.servers.Server(url = "https://freemarket.duckdns.org", description = "Production Server"),
                @io.swagger.v3.oas.annotations.servers.Server(url = "http://localhost:8080", description = "Development Server")
        }
)
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new io.swagger.v3.oas.models.info.Info()
                        .title("FreeMarket API")
                        .description("FreeMarket 프로젝트 API 문서")
                        .version("v1.0.0")
                        .contact(new io.swagger.v3.oas.models.info.Contact()
                                .name("FreeMarket")
                                .email("rlaxogjs202014030@gmail.com")
                                .url("http://localhost:8080"))
                )
                .servers(List.of(
                        new Server().url("https://freemarket.duckdns.org").description("Production Server"),
                        new Server().url("http://localhost:8080").description("Development Server")
                ))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                                .name(securitySchemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }

    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("public")
                .pathsToMatch("/api/**")
                .build();
    }
}
