package com.campusarena.eventhub.execution.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private static final long COOLDOWN_SECONDS = 30;
    private final Map<String, Long> lastSubmissionTime = new ConcurrentHashMap<>();

    public void checkRateLimit(String userId, String problemId) {
        String key = userId + "::" + problemId;
        long now = System.currentTimeMillis();

        Long last = lastSubmissionTime.get(key);
        if (last != null) {
            long elapsedSeconds = (now - last) / 1000;
            if (elapsedSeconds < COOLDOWN_SECONDS) {
                long remaining = COOLDOWN_SECONDS - elapsedSeconds;
                throw new ResponseStatusException(
                        HttpStatus.TOO_MANY_REQUESTS,
                        String.format("Please wait %d second(s) before resubmitting this problem.", remaining)
                );
            }
        }
        lastSubmissionTime.put(key, now);
    }

    public long getRemainingCooldown(String userId, String problemId) {
        String key = userId + "::" + problemId;
        Long last = lastSubmissionTime.get(key);
        if (last == null) return 0;
        long elapsed = (System.currentTimeMillis() - last) / 1000;
        return Math.max(0, COOLDOWN_SECONDS - elapsed);
    }
}
