package com.studenttracker.service;

import com.studenttracker.dto.AssignmentDto.*;

import java.util.List;

public interface AssignmentService {

    List<AssignmentResponse> getAllAssignments();

    AssignmentResponse createAssignment(CreateAssignmentRequest request, String professorName);

    AssignmentResponse submitAssignment(Long id, SubmitAssignmentRequest request, String studentEmail);

    AssignmentResponse revertSubmission(Long id, String studentEmail);

    AssignmentResponse gradeAssignment(Long id, GradeAssignmentRequest request, String teacherEmail);

    void deleteAssignment(Long id);
}
