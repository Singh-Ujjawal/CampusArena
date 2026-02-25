package com.campusarena.eventhub.execution.strategy;

import org.springframework.stereotype.Component;

@Component
public class CStrategy implements LanguageStrategy {
    @Override public String getFileName() { return "main.c"; }
    @Override public String getDockerImage() { return "gcc:latest"; }
    @Override public String getCompileCommand(String fileName) { return "gcc " + fileName + " -o main"; }
    @Override public String getRunCommand(String fileName) { return "./main"; }
}
