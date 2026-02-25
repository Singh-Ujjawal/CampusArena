package com.campusarena.eventhub.execution.model;

public enum ExecutionStatus {
    ACCEPTED,
    COMPILE_ERROR,
    RUNTIME_ERROR,
    TIME_LIMIT_EXCEEDED,
    WRONG_ANSWER,
    MEMORY_LIMIT_EXCEEDED,
    PENDING
}
