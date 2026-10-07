package com.studenttracker.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

public class AssignmentDto {

    public record AssignmentResponse(
            Long id,
            String title,
            String course,
            String professor,
            String due,
            String status,
            String submissionText,
            Instant submittedAt,
            String grade,
            String feedback,
            String color
    ) {}

    public record CreateAssignmentRequest(
            @NotBlank(message = "Title is required")
            String title,

            @NotBlank(message = "Course is required")
            String course,

            @NotBlank(message = "Due date is required")
            String due,

            String color
    ) {}

    public record SubmitAssignmentRequest(
            @NotBlank(message = "Submission content or repository link is required")
            String submissionText
    ) {}

    public record GradeAssignmentRequest(
            @NotBlank(message = "Grade is required")
            String grade,

            String feedback
    ) {}
}
