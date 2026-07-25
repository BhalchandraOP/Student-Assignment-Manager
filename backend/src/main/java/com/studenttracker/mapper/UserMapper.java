package com.studenttracker.mapper;

import com.studenttracker.dto.AuthResponse;
import com.studenttracker.entity.User;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    public AuthResponse.UserResponse toResponse(User user) {
        return new AuthResponse.UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRoles().stream()
                        .map(role -> role.getName().name())
                        .sorted()
                        .collect(Collectors.toCollection(LinkedHashSet::new)));
    }
}
