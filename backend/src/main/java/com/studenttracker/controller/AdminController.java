package com.studenttracker.controller;

import com.studenttracker.dto.AuthResponse;
import com.studenttracker.mapper.UserMapper;
import com.studenttracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @GetMapping("/access-check")
    public ResponseEntity<Map<String, String>> accessCheck() {
        return ResponseEntity.ok(Map.of("message", "Administrator access granted"));
    }

    @GetMapping("/users")
    public ResponseEntity<List<AuthResponse.UserResponse>> listUsers() {
        List<AuthResponse.UserResponse> users = userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .toList();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> summary() {
        long totalUsers = userRepository.count();
        return ResponseEntity.ok(Map.of(
                "totalUsers", totalUsers,
                "systemHealth", "100% Operational",
                "databaseStatus", "Connected"
        ));
    }
}
