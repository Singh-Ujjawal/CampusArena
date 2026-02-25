package com.campusarena.eventhub.execution.strategy;

import org.springframework.stereotype.Component;

@Component
public class PythonStrategy implements LanguageStrategy {
    @Override public String getFileName() { return "main.py"; }
    @Override public String getDockerImage() { return "python:3.11"; }
    @Override public String getCompileCommand(String fileName) { return null; }
    @Override public String getRunCommand(String fileName) { return "python3 " + fileName; }
}
