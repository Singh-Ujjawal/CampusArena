package com.campusarena.eventhub.execution.strategy;

import org.springframework.stereotype.Component;

@Component
public class JavascriptStrategy implements LanguageStrategy {
    @Override public String getFileName() { return "main.js"; }
    @Override public String getDockerImage() { return "node:20"; }
    @Override public String getCompileCommand(String fileName) { return null; }
    @Override public String getRunCommand(String fileName) { return "node " + fileName; }
}
