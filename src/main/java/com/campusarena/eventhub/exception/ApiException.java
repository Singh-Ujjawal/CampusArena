package com.campusarena.eventhub.exception;

public class ApiException extends RuntimeException {
    public ApiException(String message) {
        super(message);
    }
}
