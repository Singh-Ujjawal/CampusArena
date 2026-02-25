package com.campusarena.eventhub.leetcode.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class LcConfig {

    @Bean
    public WebClient leetCodeWebClient(WebClient.Builder builder) {
        return builder.baseUrl("https://leetcode.com/graphql").build();
    }
}
