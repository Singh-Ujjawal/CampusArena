package com.campusarena.eventhub.report.repository;

import com.campusarena.eventhub.report.model.Report;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

import java.util.Optional;

public interface ReportRepository extends MongoRepository<Report, String> {
    List<Report> findByEventId(String eventId);
    Optional<Report> findByEventIdAndEventType(String eventId, String eventType);
    List<Report> findByCreatedBy(String createdBy);
}
