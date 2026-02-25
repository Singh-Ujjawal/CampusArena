package com.campusarena.eventhub.leetcode.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class LeetCodeService {
    private final WebClient leetCodeWebClient;

    public String fetchRecentSubmissions(String username) {
        String query = """
                query recentSubmissions($username: String!) {
                  recentSubmissionList(username: $username) {
                    title
                    titleSlug
                    status
                    timestamp
                  }
                }
                """;
        Map<String, Object> requestBody = Map.of(
                "query", query,
                "variables", Map.of("username", username)
        );
        return leetCodeWebClient.post()
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block(); 
    }
}
