package com.smartroute.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI smartRouteOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SmartRoute API — Intelligent Route Planning & Delivery Optimisation")
                        .description("Production-grade RESTful API demonstrating data structures, graph algorithms (Dijkstra, A*, BFS, DFS), and TSP Nearest Neighbor delivery heuristic.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("SmartRoute Engineering Team")
                                .url("https://github.com/apple/smartroute"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")));
    }
}
