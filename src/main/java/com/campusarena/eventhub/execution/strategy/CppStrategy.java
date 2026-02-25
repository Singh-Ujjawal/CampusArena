package com.campusarena.eventhub.execution.strategy;

import org.springframework.stereotype.Component;

@Component
public class CppStrategy implements LanguageStrategy {
    @Override public String getFileName() { return "main.cpp"; }
    @Override public String getDockerImage() { return "gcc:latest"; }
    @Override public String getCompileCommand(String fileName) { return "g++ " + fileName + " -o main"; }
    @Override public String getRunCommand(String fileName) { return "./main"; }
}
