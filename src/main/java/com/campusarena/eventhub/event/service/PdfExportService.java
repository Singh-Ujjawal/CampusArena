package com.campusarena.eventhub.event.service;

import com.campusarena.eventhub.event.dto.AdminEventAnalyticsDTO;
import com.campusarena.eventhub.event.dto.TopPerformerDTO;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;

@Service
public class PdfExportService {

    public ByteArrayInputStream generateAnalyticsPdf(AdminEventAnalyticsDTO analytics, String eventName) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
            Font normalFont = new Font(Font.HELVETICA, 12);

            Paragraph title = new Paragraph("Event Analytics Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Event Name: " + eventName, normalFont));
            document.add(new Paragraph("Generated At: " + LocalDateTime.now(), normalFont));
            document.add(new Paragraph(" "));

            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(100);

            addCell(summaryTable, "Total Registrations");
            addCell(summaryTable, String.valueOf(analytics.getTotalRegistrations()));
            addCell(summaryTable, "Total Attempts");
            addCell(summaryTable, String.valueOf(analytics.getTotalAttempts()));
            addCell(summaryTable, "Total Absent");
            addCell(summaryTable, String.valueOf(analytics.getTotalAbsent()));
            addCell(summaryTable, "Average Score");
            addCell(summaryTable, String.valueOf(analytics.getAverageScore()));
            addCell(summaryTable, "Highest Score");
            addCell(summaryTable, String.valueOf(analytics.getHighestScore()));
            addCell(summaryTable, "Lowest Score");
            addCell(summaryTable, String.valueOf(analytics.getLowestScore()));
            addCell(summaryTable, "Pass Percentage");
            addCell(summaryTable, String.valueOf(analytics.getPassPercentage()) + "%");

            document.add(summaryTable);
            document.add(new Paragraph(" "));

            Paragraph topTitle = new Paragraph("Top Performers", titleFont);
            topTitle.setSpacingBefore(10);
            document.add(topTitle);
            document.add(new Paragraph(" "));

            PdfPTable topTable = new PdfPTable(4);
            topTable.setWidthPercentage(100);
            addHeaderCell(topTable, "Rank");
            addHeaderCell(topTable, "User");
            addHeaderCell(topTable, "Roll Number");
            addHeaderCell(topTable, "Score");

            for (TopPerformerDTO performer : analytics.getTopPerformers()) {
                addCell(topTable, String.valueOf(performer.getRank()));
                addCell(topTable, performer.getUsername());
                addCell(topTable, performer.getRollNumber());
                addCell(topTable, String.valueOf(performer.getScore()));
            }

            document.add(topTable);
            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    private void addCell(PdfPTable table, String content) {
        PdfPCell cell = new PdfPCell(new Phrase(content));
        cell.setPadding(5);
        table.addCell(cell);
    }

    private void addHeaderCell(PdfPTable table, String content) {
        Font font = new Font(Font.HELVETICA, 12, Font.BOLD);
        PdfPCell header = new PdfPCell(new Phrase(content, font));
        header.setPadding(5);
        table.addCell(header);
    }
}
