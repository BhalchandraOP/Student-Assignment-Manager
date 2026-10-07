package com.studenttracker.controller;

import com.studenttracker.dto.AssignmentDto.*;
import com.studenttracker.service.AssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    @GetMapping
    public ResponseEntity<List<AssignmentResponse>> getAll() {
        return ResponseEntity.ok(assignmentService.getAllAssignments());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<AssignmentResponse> create(
            @Valid @RequestBody CreateAssignmentRequest request,
            Authentication authentication
    ) {
        String professor = (authentication != null) ? authentication.getName() : "Instructor";
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(assignmentService.createAssignment(request, professor));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<AssignmentResponse> submit(
            @PathVariable Long id,
            @Valid @RequestBody SubmitAssignmentRequest request,
            Authentication authentication
    ) {
        String student = (authentication != null) ? authentication.getName() : "Student";
        return ResponseEntity.ok(assignmentService.submitAssignment(id, request, student));
    }

    @PostMapping("/{id}/revert")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<AssignmentResponse> revert(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String student = (authentication != null) ? authentication.getName() : "Student";
        return ResponseEntity.ok(assignmentService.revertSubmission(id, student));
    }

    @PostMapping("/{id}/grade")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<AssignmentResponse> grade(
            @PathVariable Long id,
            @Valid @RequestBody GradeAssignmentRequest request,
            Authentication authentication
    ) {
        String teacher = (authentication != null) ? authentication.getName() : "Teacher";
        return ResponseEntity.ok(assignmentService.gradeAssignment(id, request, teacher));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        assignmentService.deleteAssignment(id);
        return ResponseEntity.noContent().build();
    }
}
