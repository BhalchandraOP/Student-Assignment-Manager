package com.studenttracker.service;

import com.studenttracker.dto.AuthResponse;
import com.studenttracker.dto.LoginRequest;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse.UserResponse currentUser(String email);
}
