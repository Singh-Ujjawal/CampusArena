package com.campusarena.eventhub.execution.service;

import com.campusarena.eventhub.execution.dto.ExecutionRequest;
import com.campusarena.eventhub.execution.dto.ExecutionResponse;
import com.campusarena.eventhub.execution.dto.ExecutionTestCase;
import com.campusarena.eventhub.execution.model.ExecutionStatus;
import com.campusarena.eventhub.execution.strategy.LanguageStrategy;
import com.campusarena.eventhub.execution.strategy.LanguageStrategyFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class CodeExecutionService {

    private final LanguageStrategyFactory strategyFactory;

    public ExecutionResponse executeCode(ExecutionRequest request) {
        long startTime = System.currentTimeMillis();
        Path tempDir = null;
        String containerName = "sandbox-" + UUID.randomUUID();

        try {
            if (request.getSourceCode() == null || request.getSourceCode().isBlank()) {
                return ExecutionResponse.error("Source code is empty");
            }
            if (request.getLanguage() == null) {
                return ExecutionResponse.error("Language not specified");
            }
            List<ExecutionTestCase> testCases = request.getTestCases();
            if (testCases == null || testCases.isEmpty()) {
                return ExecutionResponse.error("No test cases provided");
            }

            int timeLimit = request.getTimeLimit() > 0 ? request.getTimeLimit() : 5;
            LanguageStrategy strategy = strategyFactory.getStrategy(request.getLanguage());

            tempDir = Files.createTempDirectory("sandbox-");
            String fileName = strategy.getFileName();
            Files.writeString(tempDir.resolve(fileName), request.getSourceCode());

            String volumeMount = tempDir.toAbsolutePath().toString() + ":/app";

            // Start a persistent container to run all tests
            ProcessResult startRes = runProcess(List.of(
                    "docker", "run", "-d", "--rm",
                    "--name", containerName,
                    "--memory=256m", "--cpus=1.0",
                    "--network=none",
                    "-v", volumeMount,
                    "-w", "/app",
                    strategy.getDockerImage(),
                    "sleep", "infinity"
            ), 20);

            if (startRes.exitCode != 0) {
                return ExecutionResponse.error("Failed to start execution container: " + startRes.output);
            }

            try {
                // Compilation (if needed)
                String compileCmd = strategy.getCompileCommand(fileName);
                if (compileCmd != null) {
                    ProcessResult cr = runProcess(List.of(
                            "docker", "exec", containerName,
                            "sh", "-c", compileCmd + " 2>&1"
                    ), 30);

                    if (cr.exitCode != 0) {
                        return ExecutionResponse.builder()
                                .compileError(cr.output)
                                .status(ExecutionStatus.COMPILE_ERROR)
                                .executionTime(0L)
                                .passedTestCases(0)
                                .totalTestCases(testCases.size())
                                .build();
                    }
                }

                int passedCount = 0;
                int totalCases = testCases.size();

                for (int i = 0; i < totalCases; i++) {
                    ExecutionTestCase tc = testCases.get(i);
                    String inputContent = tc.getInput() != null ? tc.getInput() : "";
                    Files.writeString(tempDir.resolve("input.txt"), inputContent);

                    String runScript = "timeout " + timeLimit + "s "
                            + strategy.getRunCommand(fileName)
                            + " < input.txt 2>&1";

                    ProcessResult rr = runProcess(List.of(
                            "docker", "exec", containerName,
                            "sh", "-c", runScript
                    ), timeLimit + 10);

                    long elapsed = System.currentTimeMillis() - startTime;

                    if (rr.timedOut || rr.exitCode == 124) {
                        return ExecutionResponse.builder()
                                .stderr("Time Limit Exceeded")
                                .status(ExecutionStatus.TIME_LIMIT_EXCEEDED)
                                .executionTime((long) (timeLimit * 1000))
                                .failedTestCase(i + 1)
                                .passedTestCases(passedCount)
                                .totalTestCases(totalCases)
                                .build();
                    }

                    if (rr.exitCode == 137 || rr.output.contains("Killed")) {
                        return ExecutionResponse.builder()
                                .stderr("Memory Limit Exceeded")
                                .status(ExecutionStatus.MEMORY_LIMIT_EXCEEDED)
                                .executionTime(elapsed)
                                .failedTestCase(i + 1)
                                .passedTestCases(passedCount)
                                .totalTestCases(totalCases)
                                .build();
                    }

                    if (rr.exitCode != 0) {
                        return ExecutionResponse.builder()
                                .stderr(rr.output)
                                .status(ExecutionStatus.RUNTIME_ERROR)
                                .executionTime(elapsed)
                                .failedTestCase(i + 1)
                                .passedTestCases(passedCount)
                                .totalTestCases(totalCases)
                                .build();
                    }

                    String actual = rr.output.trim();
                    String expected = (tc.getExpectedOutput() != null ? tc.getExpectedOutput() : "").trim();

                    if (!actual.equals(expected)) {
                        return ExecutionResponse.builder()
                                .stdout(actual)
                                .status(ExecutionStatus.WRONG_ANSWER)
                                .executionTime(elapsed)
                                .failedTestCase(i + 1)
                                .passedTestCases(passedCount)
                                .totalTestCases(totalCases)
                                .build();
                    }

                    passedCount++;
                }

                return ExecutionResponse.builder()
                        .status(ExecutionStatus.ACCEPTED)
                        .executionTime(System.currentTimeMillis() - startTime)
                        .passedTestCases(passedCount)
                        .totalTestCases(totalCases)
                        .build();

            } finally {
                // Ensure container is stopped and cleanup triggered by --rm
                runProcess(List.of("docker", "stop", "-t", "0", containerName), 10);
            }

        } catch (Exception e) {
            log.error("Code execution failed: {}", e.getMessage(), e);
            return ExecutionResponse.error(e.getMessage());
        } finally {
            if (tempDir != null) cleanup(tempDir);
        }
    }

    private ProcessResult runProcess(List<String> args, int timeoutSeconds) {
        try {
            ProcessBuilder pb = new ProcessBuilder(args);
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            StringBuilder output = new StringBuilder();
            Thread readerThread = new Thread(() -> {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                    String line;
                    int lineCount = 0;
                    while ((line = reader.readLine()) != null && lineCount < 1000) {
                        output.append(line).append("\n");
                        lineCount++;
                    }
                    if (lineCount >= 1000) {
                        output.append("... [Output truncated after 1000 lines]");
                    }
                } catch (IOException e) {
                    log.error("Error reading process output", e);
                }
            });
            readerThread.start();

            boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                readerThread.interrupt();
                return new ProcessResult(-1, output.toString().trim(), true);
            }
            
            readerThread.join(2000); // Wait for reader to finish
            return new ProcessResult(process.exitValue(), output.toString().trim(), false);

        } catch (Exception e) {
            log.error("Process execution error: {}", e.getMessage());
            return new ProcessResult(-1, e.getMessage(), false);
        }
    }

    private String readStream(InputStream is) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
            return sb.toString().trim();
        }
    }

    private void cleanup(Path dir) {
        try (Stream<Path> walk = Files.walk(dir)) {
            walk.sorted(Comparator.reverseOrder())
                    .forEach(p -> {
                        try { Files.delete(p); } catch (IOException ignored) {}
                    });
        } catch (IOException ignored) {}
    }

    private record ProcessResult(int exitCode, String output, boolean timedOut) {}
}
