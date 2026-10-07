package com.studenttracker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/teacher")
public class TeacherController {

    @GetMapping("/access-check")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<Map<String, String>> accessCheck() {
        return ResponseEntity.ok(Map.of("message", "Teacher access granted"));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> summary() {
        return ResponseEntity.ok(Map.of(
                "activeAssignments", 6,
                "pendingSubmissions", 18,
                "enrolledStudents", 42,
                "classesTaught", 3,
                "status", "Teacher portal operational"
        ));
    }
}
