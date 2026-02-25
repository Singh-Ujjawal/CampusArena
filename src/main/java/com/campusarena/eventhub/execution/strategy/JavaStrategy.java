package com.campusarena.eventhub.execution.strategy;

import org.springframework.stereotype.Component;

@Component
public class JavaStrategy implements LanguageStrategy {
    @Override public String getFileName() { return "Main.java"; }
    @Override public String getDockerImage() { return "eclipse-temurin:17"; }
    @Override public String getCompileCommand(String fileName) { return "javac " + fileName; }
    @Override public String getRunCommand(String fileName) { return "java -cp /app Main"; }
}
