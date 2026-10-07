package com.studenttracker.service.impl;

import com.studenttracker.dto.AssignmentDto.*;
import com.studenttracker.exception.ResourceNotFoundException;
import com.studenttracker.service.AssignmentService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class AssignmentServiceImpl implements AssignmentService {

    private static class AssignmentRecord {
        Long id;
        String title;
        String course;
        String professor;
        String due;
        String status; // "Pending", "Submitted", "Graded"
        String submissionText;
        Instant submittedAt;
        String submittedBy;
        String grade;
        String feedback;
        String color;

        AssignmentRecord(Long id, String title, String course, String professor, String due,
                         String status, String submissionText, Instant submittedAt,
                         String grade, String feedback, String color) {
            this.id = id;
            this.title = title;
            this.course = course;
            this.professor = professor;
            this.due = due;
            this.status = status;
            this.submissionText = submissionText;
            this.submittedAt = submittedAt;
            this.grade = grade;
            this.feedback = feedback;
            this.color = color;
        }

        AssignmentResponse toResponse() {
            return new AssignmentResponse(
                    id, title, course, professor, due, status,
                    submissionText, submittedAt, grade, feedback, color
            );
        }
    }

    private final ConcurrentHashMap<Long, AssignmentRecord> store = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(100);

    public AssignmentServiceImpl() {
        seedInitialAssignments();
    }

    private void seedInitialAssignments() {
        store.put(1L, new AssignmentRecord(
                1L, "Data Structures Assignment", "Data Structures", "Prof. Sharma",
                "24 May 2024", "Pending", "", null, null, "", "purple"
        ));
        store.put(2L, new AssignmentRecord(
                2L, "Database Systems Project", "DBMS", "Prof. Verma",
                "27 May 2024", "Pending", "", null, null, "", "green"
        ));
        store.put(3L, new AssignmentRecord(
                3L, "Operating Systems Report", "Operating Systems", "Prof. Mehta",
                "20 May 2024", "Graded",
                "https://github.com/student/os-process-scheduler",
                Instant.now().minusSeconds(86400 * 3),
                "27/30", "Thorough analysis of CPU scheduling algorithms. Excellent work!", "orange"
        ));
        store.put(4L, new AssignmentRecord(
                4L, "Computer Networks Lab", "Computer Networks", "Prof. Iyer",
                "01 Jun 2024", "Pending", "", null, null, "", "red"
        ));
    }

    @Override
    public List<AssignmentResponse> getAllAssignments() {
        List<AssignmentResponse> list = new ArrayList<>();
        store.values().stream()
                .sorted((a, b) -> a.id.compareTo(b.id))
                .forEach(record -> list.add(record.toResponse()));
        return list;
    }

    @Override
    public AssignmentResponse createAssignment(CreateAssignmentRequest request, String professorName) {
        Long id = idGenerator.incrementAndGet();
        String prof = (professorName != null && !professorName.isBlank()) ? professorName : "Prof. Sharma";
        String color = (request.color() != null && !request.color().isBlank()) ? request.color() : "purple";

        AssignmentRecord record = new AssignmentRecord(
                id, request.title().trim(), request.course().trim(), prof,
                request.due().trim(), "Pending", "", null, null, "", color
        );
        store.put(id, record);
        return record.toResponse();
    }

    @Override
    public synchronized AssignmentResponse submitAssignment(Long id, SubmitAssignmentRequest request, String studentEmail) {
        AssignmentRecord record = store.get(id);
        if (record == null) {
            throw new ResourceNotFoundException("Assignment not found with id: " + id);
        }

        record.status = "Submitted";
        record.submissionText = request.submissionText().trim();
        record.submittedAt = Instant.now();
        record.submittedBy = studentEmail;
        return record.toResponse();
    }

    @Override
    public synchronized AssignmentResponse revertSubmission(Long id, String studentEmail) {
        AssignmentRecord record = store.get(id);
        if (record == null) {
            throw new ResourceNotFoundException("Assignment not found with id: " + id);
        }

        if ("Graded".equalsIgnoreCase(record.status)) {
            throw new IllegalStateException("Cannot revert an assignment that has already been graded.");
        }

        record.status = "Pending";
        record.submissionText = "";
        record.submittedAt = null;
        record.submittedBy = null;
        return record.toResponse();
    }

    @Override
    public synchronized AssignmentResponse gradeAssignment(Long id, GradeAssignmentRequest request, String teacherEmail) {
        AssignmentRecord record = store.get(id);
        if (record == null) {
            throw new ResourceNotFoundException("Assignment not found with id: " + id);
        }

        record.status = "Graded";
        record.grade = request.grade().trim();
        record.feedback = (request.feedback() != null) ? request.feedback().trim() : "Graded by instructor.";
        return record.toResponse();
    }

    @Override
    public void deleteAssignment(Long id) {
        if (!store.containsKey(id)) {
            throw new ResourceNotFoundException("Assignment not found with id: " + id);
        }
        store.remove(id);
    }
}
