package com.campusarena.eventhub.exception;

import lombok.Getter;
import java.util.Map;

@Getter
public class UserValidationException extends RuntimeException {
    private final Map<String, String> errors;

    public UserValidationException(Map<String, String> errors) {
        super("Validation failed");
        this.errors = errors;
    }
}
