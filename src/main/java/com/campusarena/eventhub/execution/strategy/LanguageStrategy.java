package com.campusarena.eventhub.execution.strategy;

public interface LanguageStrategy {
    String getFileName();
    String getDockerImage();
    String getCompileCommand(String fileName);
    String getRunCommand(String fileName);
}
