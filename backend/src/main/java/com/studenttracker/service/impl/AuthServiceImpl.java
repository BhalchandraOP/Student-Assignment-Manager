package com.studenttracker.service.impl;

import com.studenttracker.dto.AuthResponse;
import com.studenttracker.dto.LoginRequest;
import com.studenttracker.entity.User;
import com.studenttracker.exception.ResourceNotFoundException;
import com.studenttracker.mapper.UserMapper;
import com.studenttracker.repository.UserRepository;
import com.studenttracker.security.CustomUserDetailsService;
import com.studenttracker.security.JwtService;
import com.studenttracker.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    @Override
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.password()));

        UserDetails userDetails = userDetailsService.loadUserByUsername(normalizedEmail);
        User user = findUser(normalizedEmail);
        JwtService.Token token = jwtService.generateToken(userDetails);

        return new AuthResponse(token.value(), "Bearer", token.expiresAt(), userMapper.toResponse(user));
    }

    @Override
    public AuthResponse.UserResponse currentUser(String email) {
        return userMapper.toResponse(findUser(email));
    }

    private User findUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user was not found"));
    }
}
