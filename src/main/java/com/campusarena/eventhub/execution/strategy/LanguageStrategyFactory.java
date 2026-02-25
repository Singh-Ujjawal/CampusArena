package com.campusarena.eventhub.execution.strategy;

import com.campusarena.eventhub.execution.model.Language;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Component
public class LanguageStrategyFactory {

    private final Map<Language, LanguageStrategy> strategyMap;

    public LanguageStrategyFactory(List<LanguageStrategy> strategies) {
        strategyMap = new EnumMap<>(Language.class);
        for (LanguageStrategy strategy : strategies) {
            if (strategy instanceof CppStrategy)        strategyMap.put(Language.CPP, strategy);
            else if (strategy instanceof CStrategy)     strategyMap.put(Language.C, strategy);
            else if (strategy instanceof JavaStrategy)  strategyMap.put(Language.JAVA, strategy);
            else if (strategy instanceof PythonStrategy) strategyMap.put(Language.PYTHON, strategy);
            else if (strategy instanceof JavascriptStrategy) strategyMap.put(Language.JAVASCRIPT, strategy);
        }
    }

    public LanguageStrategy getStrategy(Language language) {
        LanguageStrategy strategy = strategyMap.get(language);
        if (strategy == null) throw new IllegalArgumentException("Unsupported language: " + language);
        return strategy;
    }
}
