package com.studenttracker.config;

import com.studenttracker.entity.Role;
import com.studenttracker.entity.RoleName;
import com.studenttracker.entity.User;
import com.studenttracker.repository.RoleRepository;
import com.studenttracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "application.demo-user.enabled", havingValue = "true")
public class DemoUserInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${application.demo-user.email}")
    private String email;

    @Value("${application.demo-user.password}")
    private String password;

    @Value("${application.demo-user.full-name}")
    private String fullName;

    @Override
    @Transactional
    public void run(ApplicationArguments arguments) {
        if (userRepository.existsByEmailIgnoreCase(email)) {
            return;
        }

        Role studentRole = roleRepository.findByName(RoleName.ROLE_STUDENT)
                .orElseThrow(() -> new IllegalStateException("ROLE_STUDENT was not created by Flyway"));
        userRepository.save(new User(email, passwordEncoder.encode(password), fullName, studentRole));
    }
}
