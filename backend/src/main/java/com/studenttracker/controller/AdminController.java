package com.studenttracker.controller;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
@RestController
@RequestMapping("/api/admin")
public class AdminController {
    @GetMapping("/access-check")
    public ResponseEntity<Map<String, String>> accessCheck() {
        return ResponseEntity.ok(Map.of("message", "Administrator access granted"));
    }
}
